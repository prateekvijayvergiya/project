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
      <VisitorForm 
        mode="create"
        onSuccess={handleSuccess}
        onCancel={handleCancel}
      />
    </div>
  );
}