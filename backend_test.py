import requests
import sys
from datetime import datetime

class GamaBankAPITester:
    def __init__(self, base_url="https://gama-bank.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.student_id = None

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, {}
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    print(f"Response: {response.text}")
                except:
                    pass

            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        success, response = self.run_test(
            "Root API Endpoint",
            "GET",
            "",
            200
        )
        return success

    def test_admin_verify_correct_password(self):
        """Test admin verification with correct password"""
        success, response = self.run_test(
            "Admin Verify - Correct Password",
            "POST",
            "admin/verify",
            200,
            data={"password": "Rodrigo123"}
        )
        return success

    def test_admin_verify_wrong_password(self):
        """Test admin verification with wrong password"""
        success, response = self.run_test(
            "Admin Verify - Wrong Password",
            "POST",
            "admin/verify",
            401,
            data={"password": "wrongpassword"}
        )
        return success

    def test_get_all_students(self):
        """Test getting all students"""
        success, response = self.run_test(
            "Get All Students",
            "GET",
            "students",
            200
        )
        if success and response:
            print(f"Found {len(response)} students")
            if len(response) > 0:
                self.student_id = response[0]['id']
                print(f"Using student ID: {self.student_id}")
        return success

    def test_get_students_by_class(self):
        """Test getting students by class"""
        classes = ["8", "9", "1"]
        all_passed = True
        
        for class_year in classes:
            success, response = self.run_test(
                f"Get Students - Class {class_year}",
                "GET",
                f"students/class/{class_year}",
                200
            )
            if success and response:
                print(f"Class {class_year} has {len(response)} students")
            all_passed = all_passed and success
        
        return all_passed

    def test_get_student_detail(self):
        """Test getting student detail with transactions"""
        if not self.student_id:
            print("❌ No student ID available for testing")
            return False
            
        success, response = self.run_test(
            "Get Student Detail",
            "GET",
            f"students/{self.student_id}",
            200
        )
        if success and response:
            print(f"Student: {response.get('name', 'Unknown')}")
            print(f"Balance: {response.get('balance', 0)} gamas")
            print(f"Transactions: {len(response.get('transactions', []))}")
        return success

    def test_get_benefits(self):
        """Test getting benefits"""
        success, response = self.run_test(
            "Get Benefits",
            "GET",
            "benefits",
            200
        )
        if success and response:
            print(f"Found {len(response)} benefits")
            if len(response) >= 6:
                print("✅ Expected 6 benefits found")
            else:
                print(f"⚠️ Expected 6 benefits, found {len(response)}")
        return success

    def test_get_activities(self):
        """Test getting activities"""
        success, response = self.run_test(
            "Get Activities",
            "GET",
            "activities",
            200
        )
        if success and response:
            print(f"Found {len(response)} activities")
            if len(response) >= 6:
                print("✅ Expected 6 activities found")
            else:
                print(f"⚠️ Expected 6 activities, found {len(response)}")
        return success

    def test_admin_add_gamas(self):
        """Test adding gamas to student"""
        if not self.student_id:
            print("❌ No student ID available for testing")
            return False
            
        success, response = self.run_test(
            "Admin Add Gamas",
            "POST",
            f"admin/students/{self.student_id}/gamas",
            200,
            data={
                "amount": 10,
                "description": "Test addition",
                "operation": "add"
            }
        )
        if success and response:
            print(f"New balance: {response.get('new_balance', 'Unknown')}")
        return success

    def test_admin_subtract_gamas(self):
        """Test subtracting gamas from student"""
        if not self.student_id:
            print("❌ No student ID available for testing")
            return False
            
        success, response = self.run_test(
            "Admin Subtract Gamas",
            "POST",
            f"admin/students/{self.student_id}/gamas",
            200,
            data={
                "amount": 5,
                "description": "Test subtraction",
                "operation": "subtract"
            }
        )
        if success and response:
            print(f"New balance: {response.get('new_balance', 'Unknown')}")
        return success

    def test_admin_prevent_negative_balance(self):
        """Test that negative balance is prevented"""
        if not self.student_id:
            print("❌ No student ID available for testing")
            return False
            
        success, response = self.run_test(
            "Admin Prevent Negative Balance",
            "POST",
            f"admin/students/{self.student_id}/gamas",
            400,
            data={
                "amount": 10000,
                "description": "Test negative prevention",
                "operation": "subtract"
            }
        )
        return success

    def test_seed_database(self):
        """Test database seeding"""
        success, response = self.run_test(
            "Seed Database",
            "POST",
            "seed",
            200
        )
        return success

def main():
    print("🚀 Starting Gama Bank API Tests")
    print("=" * 50)
    
    tester = GamaBankAPITester()
    
    # Test sequence
    tests = [
        tester.test_root_endpoint,
        tester.test_seed_database,  # Seed first to ensure data
        tester.test_admin_verify_correct_password,
        tester.test_admin_verify_wrong_password,
        tester.test_get_all_students,
        tester.test_get_students_by_class,
        tester.test_get_student_detail,
        tester.test_get_benefits,
        tester.test_get_activities,
        tester.test_admin_add_gamas,
        tester.test_admin_subtract_gamas,
        tester.test_admin_prevent_negative_balance,
    ]
    
    # Run all tests
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Tests Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print("⚠️ Some tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())