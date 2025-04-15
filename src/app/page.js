import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8">
      <h1 className="text-4xl font-bold mb-8 text-center text-gray-900 dark:text-white">
        Welcome to Crypt
      </h1>
      <div className="flex gap-6">
        <a
          href="/login"
          className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
        >
          Login
        </a>
        <a
          href="/register"
          className="px-6 py-3 bg-green-600 text-white rounded-md hover:bg-green-700 transition"
        >
          Register
        </a>
      </div>
    </div>
  );
}
