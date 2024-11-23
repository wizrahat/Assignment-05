import useAuth from "../hooks/useAuth";
import Logo from ".././assets/logo.svg";
import { Link } from "react-router-dom";
import Avatar from ".././assets/avater.webp";
import { useQuery } from "@tanstack/react-query";
import api from "../api";
import ErrorComponent from "../components/ErrorComponent";

export default function HomePage() {
  const { auth, setAuth } = useAuth();

  const {
    data: quizSetData,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["quizSetData"],
    queryFn: fetchQuizSetData,
  });

  async function fetchQuizSetData() {
    const res = await api.get("/api/quizzes", {
      headers: {
        Authorization: `Bearer ${auth?.accessToken}`,
      },
    });
    return res?.data?.data;
  }
  if (isLoading) return <div>Loading...</div>;
  if (error) return <ErrorComponent />;
  return (
    <div className="bg-[#F5F3FF] min-h-screen">
      <div className="container mx-auto py-3">
        <header className="flex justify-between items-center mb-12">
          <Link to={"/"}>
            <img src={Logo} className="h-7" />
          </Link>

          <div className="flex gap-2">
            {" "}
            {auth.user && auth.user.role === "admin" && (
              <Link
                to="/dashboard"
                className="px-4 py-2 rounded hover:bg-primary hover:text-white transition-colors"
              >
                DashBoard
              </Link>
            )}
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
              <>
                <Link
                  to="/signin"
                  className="px-4 py-2 rounded hover:bg-primary hover:text-white transition-colors"
                >
                  Sign in
                </Link>
                <Link
                  to="/signup"
                  className="px-4 py-2 rounded hover:bg-primary hover:text-white transition-colors"
                >
                  Sign up
                </Link>
              </>
            )}
          </div>
        </header>
        {auth?.user && (
          <div className="text-center mb-12 ">
            <img
              src={Avatar}
              alt="Profile Picture"
              className="w-32 h-32 rounded-full border-4 border-primary mx-auto mb-4 object-cover"
            />
            <p className="text-xl text-gray-600">Welcome</p>
            <h2
              className="text-4xl font-bold text-gray-700"
              style={{ fontFamily: "jaro" }}
            >
              {auth?.user?.full_name}
            </h2>
          </div>
        )}
        <main className="bg-white p-6 rounded-md h-full">
          <section>
            <h3 className="text-2xl font-bold mb-6">Participate In Quizees</h3>

            {/* <!-- Cards --> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {quizSetData?.map((quiz) => (
                <Link
                  key={quiz?.id}
                  to={
                    quiz?.is_attempted
                      ? `quiz/${quiz?.id}/result`
                      : `quiz/${quiz?.id}`
                  }
                  className="rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow max-h-[450px] cursor-pointer group relative  "
                >
                  <div className="group-hover:scale-105  absolute transition-all text-white  text-center top-1/2 -translate-y-1/2 px-4">
                    <h1 className=" text-4xl " style={{ fontFamily: "jaro" }}>
                      {quiz?.title}
                    </h1>
                    <p className="mt-2 text-lg">{quiz?.description}</p>
                  </div>
                  {auth.user
                    ? quiz?.is_attempted && (
                        <div className="hidden absolute transition-all bg-black/80 w-full h-full left-0 top-0 text-white group-hover:grid place-items-center">
                          <div>
                            <h1 className="text-3xl font-bold">
                              Already Participated
                            </h1>
                            <p className="text-center">
                              Click to view your result
                            </p>
                          </div>
                        </div>
                      )
                    : null}
                  <img
                    src={quiz?.thumbnail}
                    alt={quiz?.title}
                    className="w-full h-full object-cover rounded mb-4"
                  />
                </Link>
              ))}
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
