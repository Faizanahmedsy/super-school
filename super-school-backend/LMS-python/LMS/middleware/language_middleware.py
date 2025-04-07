from django.utils.translation import activate
from django.conf import settings

class SetLanguageMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        lang = request.headers.get('Accept-Language', 'af')  # Default to 'en' if not provided
        if lang in dict(settings.LANGUAGES):  # Validate against allowed languages
            lang = str(lang)
            activate(lang)
            # print activated language
        return self.get_response(request)
