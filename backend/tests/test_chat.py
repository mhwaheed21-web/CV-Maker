def _long_job_description():
    return (
        "Looking for an engineer who can design APIs, improve performance, and "
        "deliver reliable production systems with strong collaboration."
    )


def _create_cv_for_user(client, headers, monkeypatch):
    async def _noop_pipeline(*args, **kwargs):
        return None

    monkeypatch.setattr("app.services.cv_service.run_generation_pipeline", _noop_pipeline)

    response = client.post(
        "/api/v1/cvs/generate",
        json={"job_description": _long_job_description(), "template_id": "minimal"},
        headers=headers,
    )
    assert response.status_code == 202
    return response.json()["id"]


def test_chat_send_and_history_persistence(client, create_user, monkeypatch):
    user = create_user()
    headers = {"Authorization": f"Bearer {user['access_token']}"}
    cv_id = _create_cv_for_user(client, headers, monkeypatch)

    async def _mock_chat_action(*_args, **_kwargs):
        return {
            "assistant_reply": "Updated as requested.",
            "target": "none",
            "cv_updated": False,
        }

    monkeypatch.setattr("app.services.ai_service.generate_chat_action", _mock_chat_action)

    send_response = client.post(
        f"/api/v1/cvs/{cv_id}/chat/",
        json={"content": "Rewrite my summary to be sharper.", "role": "user"},
        headers=headers,
    )
    assert send_response.status_code == 201
    body = send_response.json()
    assert body["assistant_message"]["content"] == "Updated as requested."

    history_response = client.get(f"/api/v1/cvs/{cv_id}/chat/", headers=headers)
    assert history_response.status_code == 200
    history = history_response.json()
    assert len(history) >= 2
    assert history[0]["role"] == "user"
    assert history[1]["role"] == "assistant"


def test_chat_updates_cv_content_when_ai_requests(client, create_user, monkeypatch):
    user = create_user()
    headers = {"Authorization": f"Bearer {user['access_token']}"}
    cv_id = _create_cv_for_user(client, headers, monkeypatch)

    async def _mock_chat_action(*_args, **_kwargs):
        return {
            "assistant_reply": "I updated your CV content.",
            "target": "cv_content",
            "cv_updated": True,
            "updated_cv_content": {
                "summary": "Sharper summary",
                "sections": [],
            },
        }

    monkeypatch.setattr("app.services.ai_service.generate_chat_action", _mock_chat_action)
    monkeypatch.setattr("app.services.chat_service.render_cv_html", lambda *_args, **_kwargs: "<html>updated</html>")

    send_response = client.post(
        f"/api/v1/cvs/{cv_id}/chat/",
        json={"content": "Make it more impact-focused.", "role": "user"},
        headers=headers,
    )
    assert send_response.status_code == 201
    assert send_response.json()["cv_updated"] is True

    cv_response = client.get(f"/api/v1/cvs/{cv_id}", headers=headers)
    assert cv_response.status_code == 200
    cv_data = cv_response.json()
    assert cv_data["cv_content"]["summary"] == "Sharper summary"
    assert cv_data["cv_content"]["_html"] == "<html>updated</html>"


def test_chat_cv_not_found_returns_404(client, create_user, monkeypatch):
    user = create_user()
    headers = {"Authorization": f"Bearer {user['access_token']}"}

    async def _mock_chat_action(*_args, **_kwargs):
        return {"assistant_reply": "ok", "target": "none", "cv_updated": False}

    monkeypatch.setattr("app.services.ai_service.generate_chat_action", _mock_chat_action)

    response = client.post(
        "/api/v1/cvs/non-existent-id/chat/",
        json={"content": "Hello", "role": "user"},
        headers=headers,
    )

    assert response.status_code == 404
