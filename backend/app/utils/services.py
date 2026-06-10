import requests
import hmac
import hashlib
import json

TIMEOUT = 30
BASE_URL = ""
SECRET_KEY = ""
PUBLIC_KEY = ""
MERCHANT_ID = ""


class ApiServices:

    def __init__(self, base_url=BASE_URL, secret_key=SECRET_KEY, merchant_id=MERCHANT_ID):
        self.base_url = base_url
        self.secret_key = secret_key
        self.merchant_id = merchant_id

    def generate_signature(self, payload: dict) -> str:
        """
        Generate HMAC-SHA512 signature for the payload using the secret key.
        :param payload: The payload to sign.
        :return: HMAC-SHA512 signature.
        """
        payload_string = json.dumps(payload, separators=(",", ":"), ensure_ascii=False)
        signature = hmac.new(
            self.secret_key.encode("utf-8"),
            payload_string.encode("utf-8"),
            hashlib.sha512,
        ).hexdigest()
        return signature

    def _build_headers(self, payload: dict) -> dict:
        signature = self.generate_signature(payload)
        return {
            "Authorization": f"Bearer {signature}",
            "MerchantId": self.merchant_id,
            "Content-Type": "application/json",
        }

    def post(self, path: str, data: dict, **kwargs):
        """Helper method for making a POST request."""
        headers = self._build_headers(data)
        timeout = kwargs.get("timeout", TIMEOUT)

        response = requests.post(
            url=f"{self.base_url}/{path}", headers=headers, json=data, timeout=timeout
        )
        return self._handle_response(response)

    @staticmethod
    def _handle_response(response):
        """Handle API responses."""
        try:
            response.raise_for_status()
            return response.json()
        except requests.exceptions.RequestException as e:
            error_message = f"Request failed: {e}"
            try:
                error_message += f" | Response: {response.json()}"
            except json.JSONDecodeError:
                pass
            raise Exception(error_message)
