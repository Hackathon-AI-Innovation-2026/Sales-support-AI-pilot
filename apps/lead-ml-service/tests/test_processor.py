import unittest
from pydantic import ValidationError
from app.predict.schemas import FeatureInput
from app.feature.processor import preprocess_batch

class TestFeatureProcessor(unittest.TestCase):
    def test_single_input_processing(self):
        input_data = FeatureInput(
            income=30_000_000,
            age=35,
            salaryAccount=True,
            emailOpenCount=3,
            emailClickCount=1,
            websiteVisitCount=5,
            loanInquiryCount=2,
            branchVisitCount=1,
            callCount=0,
            hasSaving=True,
            hasCreditCard=False,
            hasInsurance=False
        )
        
        df = preprocess_batch(input_data)
        
        # Kiểm tra shape (1 dòng, 12 cột)
        self.assertEqual(df.shape, (1, 12))
        
        # Kiểm tra scale income (30,000,000 -> 30.0)
        self.assertEqual(df.loc[0, 'income'], 30.0)
        
        # Kiểm tra convert boolean -> int (0/1)
        self.assertEqual(df.loc[0, 'salary_account'], 1)
        self.assertEqual(df.loc[0, 'has_saving'], 1)
        self.assertEqual(df.loc[0, 'has_credit_card'], 0)
        self.assertEqual(df.loc[0, 'has_insurance'], 0)
        
    def test_batch_input_processing(self):
        inputs = [
            FeatureInput(income=10_000_000, age=20, salaryAccount=False),
            FeatureInput(income=50_000_000, age=50, salaryAccount=True)
        ]
        
        df = preprocess_batch(inputs)
        
        # Kiểm tra shape (2 dòng, 12 cột)
        self.assertEqual(df.shape, (2, 12))
        self.assertEqual(df.loc[0, 'income'], 10.0)
        self.assertEqual(df.loc[1, 'income'], 50.0)
        self.assertEqual(df.loc[0, 'salary_account'], 0)
        self.assertEqual(df.loc[1, 'salary_account'], 1)
        
    def test_pydantic_validation(self):
        # Validate thu nhập không được âm
        with self.assertRaises(ValidationError):
            FeatureInput(income=-100)
            
        # Validate tuổi không được vượt quá 120
        with self.assertRaises(ValidationError):
            FeatureInput(age=150)
            
        # Validate tuổi không được âm
        with self.assertRaises(ValidationError):
            FeatureInput(age=-5)

if __name__ == '__main__':
    unittest.main()
