function App() {
  const GITHUB_TOKEN = process.env.REACT_APP_GITHUB_TOKEN

  console.log({GITHUB_TOKEN})

  return (
    <div className="App">
      Hello, GraphQL!
    </div>
  )
}

export default App
