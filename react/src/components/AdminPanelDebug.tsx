import { useAuth } from "../context/AuthContext";

export function AdminPanel({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const { user } = useAuth();
  
  if (!isOpen) {
    console.log('[DEBUG] AdminPanel isOpen=false');
    return null;
  }

  console.log('[DEBUG] AdminPanel rendering', { user, role: user?.role });

  if (!user) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg">
          <h2 className="text-xl font-bold mb-4">DEBUG: No User</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs">
            {JSON.stringify({ user }, null, 2)}
          </pre>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  if (user.role !== "admin") {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg">
          <h2 className="text-xl font-bold mb-4">DEBUG: Not Admin</h2>
          <pre className="bg-gray-100 p-4 rounded text-xs">
            {JSON.stringify({ user, role: user.role }, null, 2)}
          </pre>
          <button onClick={onClose} className="mt-4 px-4 py-2 bg-blue-500 text-white rounded">
            Close
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-white z-50 flex items-center justify-center">
      <div className="p-8">
        <h2 className="text-2xl font-bold mb-4">Admin Panel DEBUG</h2>
        <div className="bg-green-100 p-6 rounded-lg">
          <p className="text-green-800 mb-2">✓ Panel is open</p>
          <p className="text-green-800 mb-2">✓ User is logged in</p>
          <p className="text-green-800 mb-4">✓ User is admin</p>
          <pre className="bg-white p-4 rounded text-xs mb-4">
            {JSON.stringify({ user }, null, 2)}
          </pre>
          <button onClick={onClose} className="px-6 py-2 bg-indigo-600 text-white rounded-lg">
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
}
