import { VisitorForm } from './VisitorForm';

export function AddVisitor() {
  const handleSuccess = () => {
    // In a real router setup, this would navigate to the visitors list
    console.log('Visitor added successfully, navigating to visitors list');
  };

  const handleCancel = () => {
    // In a real router setup, this would navigate back
    console.log('Form cancelled, navigating back');
  };

  return (
    <div className="space-y-6 pb-20 lg:pb-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Add New Visitor</h1>
        <p className="text-gray-600 mt-2">Register a new gym visitor with their subscription details</p>
      </div>

      <VisitorForm 
        mode="create"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}