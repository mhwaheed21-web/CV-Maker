def _experience_payload(job_title="Engineer", company_name="Acme"):
    return {
        "job_title": job_title,
        "company_name": company_name,
        "start_date": "2022-01",
        "end_date": "2023-12",
        "is_current": False,
        "responsibilities": ["Built APIs"],
        "display_order": 0,
    }


def test_profile_experience_crud_flow(client, create_user):
    user = create_user()
    headers = {"Authorization": f"Bearer {user['access_token']}"}

    create_response = client.post("/api/v1/profile/experience", json=_experience_payload(), headers=headers)
    assert create_response.status_code == 201
    exp_id = create_response.json()["id"]

    list_response = client.get("/api/v1/profile/experience", headers=headers)
    assert list_response.status_code == 200
    assert any(item["id"] == exp_id for item in list_response.json())

    update_response = client.put(
        f"/api/v1/profile/experience/{exp_id}",
        json=_experience_payload(job_title="Senior Engineer"),
        headers=headers,
    )
    assert update_response.status_code == 200
    assert update_response.json()["job_title"] == "Senior Engineer"

    delete_response = client.delete(f"/api/v1/profile/experience/{exp_id}", headers=headers)
    assert delete_response.status_code == 204


def test_profile_isolation_user_cannot_modify_others_experience(client, create_user):
    user_a = create_user()
    user_b = create_user()

    headers_a = {"Authorization": f"Bearer {user_a['access_token']}"}
    headers_b = {"Authorization": f"Bearer {user_b['access_token']}"}

    create_response = client.post("/api/v1/profile/experience", json=_experience_payload(), headers=headers_a)
    assert create_response.status_code == 201
    exp_id = create_response.json()["id"]

    forbidden_update = client.put(
        f"/api/v1/profile/experience/{exp_id}",
        json=_experience_payload(job_title="Hijacked"),
        headers=headers_b,
    )
    assert forbidden_update.status_code == 404

    forbidden_delete = client.delete(f"/api/v1/profile/experience/{exp_id}", headers=headers_b)
    assert forbidden_delete.status_code == 404
