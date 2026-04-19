from conftest import get_test_client


def test_root_health_check_returns_ok():
    client = get_test_client()

    response = client.get("/")

    assert response.status_code == 200
    payload = response.json()
    assert payload.get("status") == "ok"
