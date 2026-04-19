import os
import sys
import uuid

import pytest

from fastapi.testclient import TestClient

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from app.main import app


@pytest.fixture(scope="session")
def client() -> TestClient:
    with TestClient(app) as test_client:
        yield test_client


@pytest.fixture
def create_user(client: TestClient):
    def _create_user(password: str = "Password123!", full_name: str = "Test User"):
        email = f"test_{uuid.uuid4().hex[:10]}@example.com"
        payload = {
            "email": email,
            "password": password,
            "full_name": full_name,
        }

        register_response = client.post("/api/v1/auth/register", json=payload)
        assert register_response.status_code == 201
        tokens = register_response.json()

        return {
            "email": email,
            "password": password,
            "full_name": full_name,
            "access_token": tokens["access_token"],
            "refresh_token": tokens["refresh_token"],
        }

    return _create_user


@pytest.fixture
def auth_headers(create_user):
    user = create_user()
    return {"Authorization": f"Bearer {user['access_token']}"}


def get_test_client() -> TestClient:
    return TestClient(app)
