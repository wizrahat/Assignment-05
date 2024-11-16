import useAuth from "../hooks/useAuth";
import Logo from ".././assets/logo.svg";
import { Link } from "react-router-dom";
import Avatar from ".././assets/avater.webp";

export default function HomePage() {
  const { auth, setAuth } = useAuth();

  return (
    <div className="bg-[#F5F3FF] min-h-screen">
      <div className="container mx-auto py-3">
        <header className="flex justify-between items-center mb-12">
          <img src={Logo} className="h-7" />
          <div>
            {auth?.user ? (
              <Link
                onClick={() => {
                  setAuth({});
                }}
                to={"/signin"}
                className="px-4 py-2 rounded hover:bg-primary hover:text-white transition-colors"
              >
                Sign out
              </Link>
            ) : (
              <Link
                to="/signin"
                className="px-4 py-2 rounded hover:bg-primary hover:text-white transition-colors"
              >
                Sign in
              </Link>
            )}
          </div>
        </header>
        {auth?.user && (
          <div className="text-center mb-12">
            <img
              src={Avatar}
              alt="Profile Picture"
              className="w-32 h-32 rounded-full border-4 border-primary mx-auto mb-4 object-cover"
            />
            <p className="text-xl text-gray-600">Welcome</p>
            <h2 className="text-4xl font-bold text-gray-700">Saad Hasan</h2>
          </div>
        )}
        <main className="bg-white p-6 rounded-md h-full">
          <section>
            <h3 className="text-2xl font-bold mb-6">Participate In Quizees</h3>

            {/* <!-- Cards --> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <a
                href="./result.html"
                className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow max-h-[450px] relative group cursor-pointer"
              >
                <div className="group-hover:scale-105 absolute transition-all text-white  text-center top-1/2 -translate-y-1/2 px-4">
                  <h1 className=" text-5xl">JavaScript Basic Quiz</h1>
                  <p className="mt-2 text-lg">
                    Test your knowledge of JavaScript basics with quizzes that
                    cover essential concepts, syntax, and foundational
                    programming skills
                  </p>
                </div>
                <div className="hidden absolute transition-all bg-black/80 w-full h-full left-0 top-0 text-white group-hover:grid place-items-center">
                  <div>
                    <h1 className="text-3xl font-bold">Already Participated</h1>
                    <p className="text-center">
                      Click to view your leaderboard
                    </p>
                  </div>
                </div>
                <img
                  src="./assets/backgrounds/2.jpg"
                  alt="JavaScript Hoisting"
                  className="w-full h-full object-cover rounded mb-4"
                />
              </a>
            </div>
          </section>
        </main>

        <footer className="mt-6 mb-3 opacity-40 text-center">
          Copyright &copy; 2024 Learn With Sumit | All Rights Reserved
        </footer>
      </div>
    </div>
  );
}
