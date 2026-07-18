from pydantic import BaseModel, Field
from pydantic.alias_generators import to_camel

class FeatureInput(BaseModel):
    income: float = Field(default=0.0, ge=0.0, description="Thu nhập tháng (VND)")
    age: int = Field(default=18, ge=0, le=120, description="Tuổi khách hàng")
    salary_account: bool = Field(default=False, description="Nhận lương qua SHB")
    email_open_count: int = Field(default=0, ge=0, description="Số lần mở email (30 ngày)")
    email_click_count: int = Field(default=0, ge=0, description="Số lần click email (30 ngày)")
    website_visit_count: int = Field(default=0, ge=0, description="Số lần visit website (30 ngày)")
    loan_inquiry_count: int = Field(default=0, ge=0, description="Số lần hỏi về vay vốn (30 ngày)")
    branch_visit_count: int = Field(default=0, ge=0, description="Số lần đến chi nhánh (30 ngày)")
    call_count: int = Field(default=0, ge=0, description="Số cuộc gọi (30 ngày)")
    has_saving: bool = Field(default=False, description="Có tài khoản tiết kiệm")
    has_credit_card: bool = Field(default=False, description="Có thẻ tín dụng")
    has_insurance: bool = Field(default=False, description="Có bảo hiểm")

    model_config = {
        "alias_generator": to_camel,
        "populate_by_name": True,
        "json_schema_extra": {
            "example": {
                "income": 30000000,
                "age": 35,
                "salaryAccount": True,
                "emailOpenCount": 3,
                "emailClickCount": 1,
                "websiteVisitCount": 5,
                "loanInquiryCount": 2,
                "branchVisitCount": 1,
                "callCount": 0,
                "hasSaving": True,
                "hasCreditCard": False,
                "hasInsurance": False
            }
        }
    }
