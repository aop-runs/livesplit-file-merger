import React from 'react'
import { ContentContainer } from './ContentContainer.jsx'
import { Footer } from './Footer.jsx'
import { Header } from './Header.jsx'

export const App = () => {
  return (
      <React.Fragment>
        <Header />
        <br/><br/><br/>
        <ContentContainer />
        <br/><br/><br/>
        <Footer />
      </React.Fragment>
  )
}

export default App