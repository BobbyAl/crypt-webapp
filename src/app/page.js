import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        Welcome to Crypt
      </h1>
      <div className="flex gap-6">
        <Link
          href="/crypt-webapp/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Login
        </Link>
        <Link
          href="/crypt-webapp/register"
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Register
        </Link>
      </div>
    </div>
  );
}
