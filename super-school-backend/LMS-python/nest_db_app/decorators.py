# decorators.py
import os
from functools import wraps

import jwt
from django.http import JsonResponse

from nest_db_app.models import User, Role, Permission, Module  # Import your models

SECRET_KEY = os.environ.get('JWT_SECRET')  # Use settings.SECRET_KEY if shared across apps


def jwt_decode_handler(token):
    try:
        decoded_token = jwt.decode(token, SECRET_KEY, algorithms=["HS256"])
        return decoded_token
    except (jwt.ExpiredSignatureError, jwt.InvalidTokenError) as e:
        return None


def get_user_from_token(decoded_token):
    if decoded_token is None:
        return None, "Token is invalid"
    try:
        user_id = decoded_token.get('sub')
        role_name = decoded_token.get('role_name')
        print(user_id,role_name,'role name and user id')
        if user_id:
            user = User.objects.get(pk=user_id)
            if user.status != 'verified':
                return None, "User is not verified"
            role_name = user.role.role_name
            return user, role_name
    except User.DoesNotExist:
        return None
    return None


def permission_required(module_name, action):
    def actual_decorator(function):
        @wraps(function)
        def wrapped_view(self, request, *args, **kwargs):
            # Access the Authorization header
            authorization_token = request.META.get('HTTP_AUTHORIZATION', None)
            if not authorization_token or not authorization_token.startswith('Bearer '):
                return JsonResponse({'error': 'Token not provided or malformed'}, status=400)

            # Extract and decode the JWT token
            token = authorization_token.split(' ')[1]
            try:
                decoded_token = jwt_decode_handler(token)
            except Exception:
                return JsonResponse({'error': 'Invalid or expired token'}, status=401)

            # Check if user and role are valid
            user, role_name = get_user_from_token(decoded_token)
            if not user:
                return JsonResponse({'error': 'User not found'}, status=404)

            # Get the role ID and module ID based on role_name and module_name
            try:
                role_id = Role.objects.get(role_name=role_name).id
            except Role.DoesNotExist:
                return JsonResponse({'error': f'Role "{role_name}" not found'}, status=404)

            try:
                module_id = Module.objects.get(module_name_show=module_name).id
                print(module_id,'module_id')
            except Module.DoesNotExist:
                return JsonResponse({'error': f'Module "{module_name}" not found'}, status=404)

            # Fetch permission for the given role and module
            permission = Permission.objects.filter(role_id=role_id, module_id=module_id).values('allow').first()
            print(permission,'permission')
            if not permission or not permission['allow'].get(action, False):
                return JsonResponse({'error': 'You do not have access to perform this action'}, status=403)

            # If all checks pass, attach the user to the request for further use
            request.user = user

            # Call the original view function if permission check passes
            return function(self, request, *args, **kwargs)

        return wrapped_view

    return actual_decorator
