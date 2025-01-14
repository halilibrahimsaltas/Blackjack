import { useState } from 'react';

const RegisterForm = ({ onRegister, onSwitchToLogin }) => {
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    confirmPassword: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      alert('Şifreler eşleşmiyor!');
      return;
    }
    onRegister({
      username: formData.username,
      password: formData.password
    });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-md mx-auto p-8 bg-gradient-to-br from-gray-700 to-gray-800 rounded-xl shadow-2xl border border-gray-600">
      <h2 className="text-3xl font-bold mb-8 text-center text-yellow-500 font-serif">Kayıt Ol</h2>
      
      <div className="mb-6">
        <label className="block text-yellow-500 text-lg font-bold mb-3">
          Kullanıcı Adı
        </label>
        <input
          type="text"
          value={formData.username}
          onChange={(e) => setFormData({ ...formData, username: e.target.value })}
          className="w-full px-4 py-3 text-xl rounded-lg border-2 border-yellow-500 bg-gray-800 text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
          required
          minLength={3}
        />
      </div>

      <div className="mb-6">
        <label className="block text-yellow-500 text-lg font-bold mb-3">
          Şifre
        </label>
        <input
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
          className="w-full px-4 py-3 text-xl rounded-lg border-2 border-yellow-500 bg-gray-800 text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
          required
          minLength={6}
        />
      </div>

      <div className="mb-8">
        <label className="block text-yellow-500 text-lg font-bold mb-3">
          Şifre Tekrar
        </label>
        <input
          type="password"
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="w-full px-4 py-3 text-xl rounded-lg border-2 border-yellow-500 bg-gray-800 text-white focus:outline-none focus:border-yellow-400 focus:ring-2 focus:ring-yellow-400"
          required
          minLength={6}
        />
      </div>

      <button
        type="submit"
        className="w-full py-4 text-xl font-bold text-white bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-lg shadow-lg hover:from-yellow-600 hover:to-yellow-700 transition-all duration-300"
      >
        Kayıt Ol
      </button>

      <p className="mt-6 text-center text-gray-400">
        Zaten hesabınız var mı?{' '}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-yellow-500 hover:text-yellow-400 font-semibold"
        >
          Giriş Yap
        </button>
      </p>
    </form>
  );
};

export default RegisterForm; 