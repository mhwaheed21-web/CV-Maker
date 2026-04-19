from types import SimpleNamespace


def _long_job_description():
    return (
        "We need a pragmatic engineer with strong API design, testing discipline, "
        "performance tuning experience, and the ability to collaborate across teams."
    )


def test_generate_cv_accepts_request_and_returns_pending(client, create_user, monkeypatch):
    user = create_user()
    headers = {"Authorization": f"Bearer {user['access_token']}"}

    async def _noop_pipeline(*args, **kwargs):
        return None

    monkeypatch.setattr("app.services.cv_service.run_generation_pipeline", _noop_pipeline)

    response = client.post(
        "/api/v1/cvs/generate",
        json={"job_description": _long_job_description(), "template_id": "minimal"},
        headers=headers,
    )

    assert response.status_code == 202
    data = response.json()
    assert data["status"] == "pending"


def test_generate_cv_invalid_template_returns_422(client, create_user):
    user = create_user()
    headers = {"Authorization": f"Bearer {user['access_token']}"}

    response = client.post(
        "/api/v1/cvs/generate",
        json={"job_description": _long_job_description(), "template_id": "invalid-template"},
        headers=headers,
    )

    assert response.status_code == 422
    detail = response.json().get("detail", {})
    assert "allowed_template_ids" in detail


def test_cv_status_and_list_endpoints(client, create_user, monkeypatch):
    user = create_user()
    headers = {"Authorization": f"Bearer {user['access_token']}"}

    async def _noop_pipeline(*args, **kwargs):
        return None

    monkeypatch.setattr("app.services.cv_service.run_generation_pipeline", _noop_pipeline)

    generate_response = client.post(
        "/api/v1/cvs/generate",
        json={"job_description": _long_job_description(), "template_id": "minimal"},
        headers=headers,
    )
    assert generate_response.status_code == 202
    cv_id = generate_response.json()["id"]

    status_response = client.get(f"/api/v1/cvs/{cv_id}/status", headers=headers)
    assert status_response.status_code == 200
    assert status_response.json()["id"] == cv_id

    list_response = client.get("/api/v1/cvs/", headers=headers)
    assert list_response.status_code == 200
    assert any(item["id"] == cv_id for item in list_response.json())


def test_download_cv_uses_mocked_pdf_boundaries(client, create_user, monkeypatch):
    user = create_user()
    headers = {"Authorization": f"Bearer {user['access_token']}"}

    async def _noop_pipeline(*args, **kwargs):
        return None

    monkeypatch.setattr("app.services.cv_service.run_generation_pipeline", _noop_pipeline)

    generate_response = client.post(
        "/api/v1/cvs/generate",
        json={"job_description": _long_job_description(), "template_id": "minimal"},
        headers=headers,
    )
    assert generate_response.status_code == 202
    cv_id = generate_response.json()["id"]

    async def _mock_get_cv_by_id(_db, _user_id, requested_cv_id):
        return SimpleNamespace(
            id=requested_cv_id,
            status="complete",
            cv_content={"summary": "Generated summary", "sections": []},
            template_id="minimal",
        )

    monkeypatch.setattr("app.services.cv_service.get_cv_by_id", _mock_get_cv_by_id)

    monkeypatch.setattr("app.api.v1.cvs.render_cv_html", lambda *_args, **_kwargs: "<html>ok</html>")
    monkeypatch.setattr("app.api.v1.cvs.generate_pdf", lambda *_args, **_kwargs: b"PDF-BYTES")

    download_response = client.get(f"/api/v1/cvs/{cv_id}/download", headers=headers)

    assert download_response.status_code == 200
    assert download_response.headers["content-type"].startswith("application/pdf")
    assert download_response.content == b"PDF-BYTES"
