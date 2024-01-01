// useReducer: simple Counter
// http://localhost:3000/isolated/exercise/01.js

import * as React from 'react'

const countReducer = (state, action) => {
  const {type} = action
  switch (type) {
    case 'INCREMENT':
      return {
        ...state,
        count: state.count + action.step,
      }
    default:
      throw new Error(`Unknown type ${type}`)
  }
}

function Counter({initialCount = 0, step = 1}) {
  // 🐨 replace React.useState with React.useReducer.
  // 💰 React.useReducer(countReducer, initialCount)
  const [state, setState] = React.useReducer(countReducer, {count: 0})

  // 💰 you can write the countReducer function so you don't have to make any
  // changes to the next two lines of code! Remember:
  // The 1st argument is called "state" - the current value of count
  // The 2nd argument is called "newState" - the value passed to setCount
  const {count} = state
  const increment = () => setState({type: 'INCREMENT', step})
  return (
    <>
      <button onClick={increment}>{count}</button>
    </>
  )
}

function App() {
  return <Counter />
}

export default App
