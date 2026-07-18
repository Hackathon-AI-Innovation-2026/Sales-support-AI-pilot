from typing import List, Union
import pandas as pd
from app.predict.schemas import FeatureInput

def preprocess_batch(inputs: Union[FeatureInput, List[FeatureInput]]) -> pd.DataFrame:
    """
    Tiền xử lý danh sách đầu vào FeatureInput hoặc một phần tử đơn lẻ:
    - Scale income: chia cho 1,000,000.
    - Convert boolean -> integer (0 hoặc 1).
    - Tạo pandas DataFrame và giữ nguyên thứ tự 12 đặc trưng mà mô hình yêu cầu.
    """
    if not isinstance(inputs, list):
        inputs = [inputs]
        
    records = []
    for item in inputs:
        # Lấy dữ liệu dạng dict dưới dạng snake_case
        data_dict = item.model_dump()
        
        # Tiền xử lý
        data_dict['income'] = data_dict['income'] / 1_000_000.0
        data_dict['salary_account'] = 1 if data_dict['salary_account'] else 0
        data_dict['has_saving'] = 1 if data_dict['has_saving'] else 0
        data_dict['has_credit_card'] = 1 if data_dict['has_credit_card'] else 0
        data_dict['has_insurance'] = 1 if data_dict['has_insurance'] else 0
        
        records.append(data_dict)
        
    # Đảm bảo thứ tự cột tuyệt đối chính xác với lúc huấn luyện mô hình
    ordered_features = [
        'income', 'age', 'salary_account', 'email_open_count', 'email_click_count',
        'website_visit_count', 'loan_inquiry_count', 'branch_visit_count', 'call_count',
        'has_saving', 'has_credit_card', 'has_insurance'
    ]
    
    df = pd.DataFrame(records, columns=ordered_features)
    return df
