from rest_framework.pagination import PageNumberPagination
from rest_framework.response import Response


class GlobalPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 30

    def get_page_size(self, request):
        page_size = request.query_params.get(self.page_size_query_param, self.page_size)

        try:
            page_size = int(page_size)
            if page_size > self.max_page_size:
                page_size = self.max_page_size
        except (TypeError, ValueError):
            page_size = self.page_size

        return page_size

    def get_paginated_response(self, data):
        per_page = self.get_page_size(self.request)
        total_pages = self.page.paginator.num_pages
        current_page = self.page.number
        total_records = self.page.paginator.count

        return Response({
            'totalCount': total_records,
            'next': self.get_next_link(),
            'previous': self.get_previous_link(),
            'records_per_page': per_page,
            'totalPages': total_pages,
            'currentPage': current_page,
            'results': data
        })

    def paginate_queryset(self, queryset, request, view=None):
        """
        Paginate the queryset or raw data (list of dicts).
        """

        if isinstance(queryset, list):
            return self.paginate_raw_data(queryset, request)

        allowed_ordering_fields = ['created_at', 'updated_at', 'deleted_at']
        ordering_param = request.query_params.get('ordering', '-created_at')

        ordering_fields = [
            field if field.lstrip('-') in allowed_ordering_fields else '-created_at'
            for field in ordering_param.split(',')
        ]

        queryset = queryset.order_by(*ordering_fields)

        page_size = self.get_page_size(request)
        paginator = self.django_paginator_class(queryset, page_size)

        page_number = request.query_params.get(self.page_query_param, 1)
        self.page = paginator.get_page(page_number)
        self.request = request

        return list(self.page)

    def paginate_raw_data(self, data, request):
        """
        Handle pagination for raw data (list of dictionaries).
        """
        page_size = self.get_page_size(request)
        paginator = self.django_paginator_class(data, page_size)

        page_number = request.query_params.get(self.page_query_param, 1)
        self.page = paginator.get_page(page_number)
        self.request = request

        return list(self.page)
