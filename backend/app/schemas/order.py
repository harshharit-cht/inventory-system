from pydantic import BaseModel
from datetime import datetime
from .product import ProductResponse
from .customer import CustomerResponse

class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderItemResponse(BaseModel):
    id: int
    product_id: int
    quantity: int
    unit_price: float
    product: ProductResponse | None = None

    model_config = {"from_attributes": True}

class OrderCreate(BaseModel):
    customer_id: int
    items: list[OrderItemCreate]

class OrderResponse(BaseModel):
    id: int
    customer_id: int
    total_amount: float
    created_at: datetime
    customer: CustomerResponse | None = None
    items: list[OrderItemResponse] = []

    model_config = {"from_attributes": True}