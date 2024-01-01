// useCallback: custom hooks
// http://localhost:3000/isolated/exercise/02.js

import * as React from 'react'
import {
  fetchPokemon,
  PokemonForm,
  PokemonDataView,
  PokemonInfoFallback,
  PokemonErrorBoundary,
} from '../pokemon'

function pokemonInfoReducer(state, action) {
  switch (action.type) {
    case 'pending': {
      return {status: 'pending', data: null, error: null}
    }
    case 'resolved': {
      return {status: 'resolved', data: action.data, error: null}
    }
    case 'rejected': {
      return {status: 'rejected', data: null, error: action.error}
    }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`)
    }
  }
}

// Extra 01
////////////////////////////////////////////////////////////////////////
// const useAsync = (asyncCallback, initialState) => {                //
//   const [state, dispatch] = React.useReducer(pokemonInfoReducer, { //
//     status: 'idle',                                                //
//     data: null,                                                    //
//     error: null,                                                   //
//     ...initialState,                                               //
//   })                                                               //
//                                                                    //
//   React.useEffect(() => {                                          //
//     const promise = asyncCallback()                                //
//     if (!promise) {                                                //
//       return                                                       //
//     }                                                              //
//     dispatch({type: 'pending'})                                    //
//     promise.then(                                                  //
//       pokemon => {                                                 //
//         dispatch({type: 'resolved', data: pokemon})                //
//       },                                                           //
//       error => {                                                   //
//         dispatch({type: 'rejected', error})                        //
//       },                                                           //
//     )                                                              //
//   }, [asyncCallback])                                              //
//                                                                    //
//   return state                                                     //
// }                                                                  //
////////////////////////////////////////////////////////////////////////

const useSafeDispatch = dispatch => {
  const mountedRef = React.useRef(false)

  React.useEffect(() => {
    mountedRef.current = true
    return () => (mountedRef.current = false)
  })

  return React.useCallback(
    (...args) => (mountedRef.current ? dispatch(...args) : void 0),
    [dispatch],
  )
}

const useAsync = initialState => {
  const [state, unsafeDispatch] = React.useReducer(pokemonInfoReducer, {
    status: 'idle',
    data: null,
    error: null,
    ...initialState,
  })

  const dispatch = useSafeDispatch(unsafeDispatch)

  const run = React.useCallback(
    promise => {
      dispatch({type: 'pending'})
      promise.then(
        data => dispatch({type: 'resolved', data}),
        error => dispatch({type: 'rejected', error}),
      )
    },
    [dispatch],
  )

  return {
    ...state,
    run,
  }
}

// TODO: Reimplement extra-credit #3 aborting the Promise!
function PokemonInfo({pokemonName}) {
  // Extra 01
  //////////////////////////////////////////////////////////////////////////////////
  // const asyncFn = React.useCallback(() => {                                    //
  //   if (!pokemonName) {                                                        //
  //     return                                                                   //
  //   }                                                                          //
  //   return fetchPokemon(pokemonName)                                           //
  // }, [pokemonName])                                                            //
  //                                                                              //
  // const state = useAsync(asyncFn, {status: pokemonName ? 'pending' : 'idle'})  //
  //                                                                              //
  //                                                                              //
  // const {data: pokemon, status, error, run} = state                            //
  //////////////////////////////////////////////////////////////////////////////////

  const state = useAsync({status: pokemonName ? 'pending' : 'idle'})

  const {data: pokemon, status, error, run} = state

  React.useEffect(() => {
    if (!pokemonName) return
    run(fetchPokemon(pokemonName))
  }, [pokemonName, run])

  if (status === 'idle' || !pokemonName) {
    return 'Submit a pokemon'
  } else if (status === 'pending') {
    return <PokemonInfoFallback name={pokemonName} />
  } else if (status === 'rejected') {
    throw error
  } else if (status === 'resolved') {
    return <PokemonDataView pokemon={pokemon} />
  }

  throw new Error('This should be impossible')
}

function App() {
  const [pokemonName, setPokemonName] = React.useState('')

  function handleSubmit(newPokemonName) {
    setPokemonName(newPokemonName)
  }

  function handleReset() {
    setPokemonName('')
  }

  return (
    <div className="pokemon-info-app">
      <PokemonForm pokemonName={pokemonName} onSubmit={handleSubmit} />
      <hr />
      <div className="pokemon-info">
        <PokemonErrorBoundary onReset={handleReset} resetKeys={[pokemonName]}>
          <PokemonInfo pokemonName={pokemonName} />
        </PokemonErrorBoundary>
      </div>
    </div>
  )
}

function AppWithUnmountCheckbox() {
  const [mountApp, setMountApp] = React.useState(true)
  return (
    <div>
      <label>
        <input
          type="checkbox"
          checked={mountApp}
          onChange={e => setMountApp(e.target.checked)}
        />{' '}
        Mount Component
      </label>
      <hr />
      {mountApp ? <App /> : null}
    </div>
  )
}

export default AppWithUnmountCheckbox
