
const Loading = () => {
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="flex flex-col justify-center items-center">
        <div className="h-10 w-10 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
        <span className="ml-2 text-gray-400">Loading...</span>
      </div>
    </div>
  )
}

export default Loading