import React, { useState } from 'react'
import { ApolloProvider, Mutation, Query } from 'react-apollo'
import client from './client'
import { ADD_STAR, REMOVE_STAR, SEARCH_REPOSITORIES } from './graphql'

function App() {
  const StarButton = props => {
    const { node, query, first, last, before, after } = props
    const totalCount = node.stargazers.totalCount
    const viewerHasStarred = node.viewerHasStarred
    const starCount = totalCount === 1 ? "1 star" : `${totalCount} stars`
    const StarStatus = ({ addOrRemoveStar }) => {
      return (
        <button
          onClick={
            () => addOrRemoveStar({
              variables: { input: { starrableId: node.id } }
            })
          }
        >
          {starCount} | {viewerHasStarred ? "starred" : "-"}
        </button>
      )
    }

    return (
      <Mutation
        mutation={viewerHasStarred ? REMOVE_STAR : ADD_STAR}
        // refetchQueriesはこのように関数形式で書いても良い
        // 実行結果に基づいて何らかの処理をする場合は関数形式で記述する必要がある
        refetchQueries={mutationResult => {
          return [
            {
              query: SEARCH_REPOSITORIES,
              variables: { query, first, last, before, after }
            }
          ]
        }}
        // refetchQueries={
        //   [
        //     {
        //       query: SEARCH_REPOSITORIES,
        //       variables: { query, first, last, before, after }
        //     }
        //   ]
        // }
      >
        {
          addOrRemoveStar => <StarStatus addOrRemoveStar={addOrRemoveStar} />
        }
      </Mutation>
    )
  }

  const PER_PAGE = 5
  const DEFAULT_STATE = {
    first: PER_PAGE,
    after: null,
    last: null,
    before: null,
    query: "フロントエンドエンジニア"
  }

  const [variables, setVariables] = useState(DEFAULT_STATE)
  const { query, first, last, before, after } = variables
  console.log({ query })

  const handleChange = event => {
    const new_query = event.target.value
    variables["query"] = new_query
    const new_variables = Object.assign({}, variables)
    setVariables(new_variables)
  }

  const goPrevious = search => {
    setVariables({
      first: null,
      after: null,
      last: PER_PAGE,
      before: search.pageInfo.startCursor,
      query: variables['query']
    })
  }
  const goNext = search => {
    setVariables({
      first: PER_PAGE,
      after: search.pageInfo.endCursor,
      last: null,
      before: null,
      query: variables['query']
    })
  }

  return (
    <ApolloProvider client={client}>
      <form>
        <input value={query} onChange={handleChange} />
      </form>
      <Query
        query={SEARCH_REPOSITORIES}
        variables={{ query, first, last, before, after }}
      >
        {
          ({ loading, error, data }) => {
            if (loading) return 'Loading...'
            if (error) return `Error! ${error.message}`

            console.log(data.search)
            const search = data.search
            const repositoryCount = search.repositoryCount
            const repositoryUnit = repositoryCount === 1 ? 'Repository' : 'Repositories'
            const title = `GitHub Repositories Search Results - ${repositoryCount} ${repositoryUnit}`
            return (
              <>
                <h2>{title}</h2>
                <ul>
                  {
                    search.edges.map(edge => {
                      const node = edge.node
                      return (
                        <li key={node.id}>
                          <a href={node.url} target="_blank" rel="noopener noreferrer">{node.name}</a>
                          &nbsp;
                          <StarButton node={node} {...{query, first, last, before, after}} />
                        </li>
                      )
                    })
                  }
                </ul>
                {
                  search.pageInfo.hasPreviousPage === true ?
                    <button onClick={() => goPrevious(search)}>
                      Previous
                    </button>
                    :
                    null
                }
                {
                  search.pageInfo.hasNextPage === true ?
                    <button onClick={() => goNext(search)}>
                      {/* <button> */}
                      Next
                    </button>
                    :
                    null
                }
              </>
            )
          }
        }
      </Query>
    </ApolloProvider>
  )
}

export default App
