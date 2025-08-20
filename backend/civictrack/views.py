from django.shortcuts import render
from rest_framework.decorators import api_view
from rest_framework.response import Response

@api_view(['GET'])
def product_list(request):
    products = [
        {"id": 1, "name": "Laptop", "price": 50000},
        {"id": 2, "name": "Mouse", "price": 500}
    ]
    return Response(products)

def home(request):
    return render(request, 'home.html')
