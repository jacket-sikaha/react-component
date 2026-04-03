import { useSearchParams } from 'react-router-dom';

function TestAuth() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const verifyToken = async (token: string) => {
    try {
      const res = await fetch('/api/token/verify', {
        method: 'POST',
        body: JSON.stringify({ token }),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const data = await res.json();
      console.log('校验jwt 是否有效:', data);
    } catch (error) {
      return null;
    }
  };

  return (
    <div className="flex flex-col items-center justify-center gap-3 text-white">
      <h1>token: {token}</h1>
      <button>logout</button>
      <button
        onClick={() => {
          //  外部跳转只能location
          window.location.replace(
            `${import.meta.env.VITE_ORIGIN_SERVER}/?redirectURL=${encodeURIComponent(window.location.href)}`
          );
          return null;
        }}
      >
        login
      </button>
      <button onClick={() => verifyToken(token || '')}>verify token</button>
    </div>
  );
}

export default TestAuth;
