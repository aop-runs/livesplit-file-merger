import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ContentContainer } from './ContentContainer'
import '../styles/style.scss'

export const App = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ContentContainer />
    </DndProvider>
  )
}

export default App