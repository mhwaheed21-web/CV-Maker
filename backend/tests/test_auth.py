import uuid


def test_register_returns_tokens(client):
    unique_email = f"register_{uuid.uuid4().hex[:10]}@example.com"
    payload = {
        "email": unique_email,
        "password": "Password123!",
        "full_name": "Register Case",
    }

    response = client.post("/api/v1/auth/register", json=payload)

    assert response.status_code == 201
    data = response.json()
    assert data.get("access_token")
    assert data.get("refresh_token")
    assert data.get("token_type") == "bearer"


def test_login_wrong_password_returns_401(client, create_user):
    user = create_user(password="GoodPassword123!")

    response = client.post(
        "/api/v1/auth/login",
        json={"email": user["email"], "password": "WrongPassword!"},
    )

    assert response.status_code == 401


def test_get_me_without_token_is_rejected(client):
    response = client.get("/api/v1/auth/me")

    assert response.status_code in (401, 403)


def test_refresh_returns_new_access_token(client, create_user):
    user = create_user()

    response = client.post("/api/v1/auth/refresh", json={"refresh_token": user["refresh_token"]})

    assert response.status_code == 200
    data = response.json()
    assert data.get("access_token")
    assert data.get("refresh_token")


def test_get_me_with_token_returns_user(client, create_user):
    user = create_user(full_name="Auth Me")
    headers = {"Authorization": f"Bearer {user['access_token']}"}

    response = client.get("/api/v1/auth/me", headers=headers)

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == user["email"]
    assert data["full_name"] == "Auth Me"
