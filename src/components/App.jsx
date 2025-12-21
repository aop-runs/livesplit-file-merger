import { DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import { ListContainer } from './Splits/ListContainer'
import '../styles/style.scss'

export const App = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <ListContainer />
    </DndProvider>
  )
}

export default App