//Based on: https://medium.com/@liadshiran92/easy-drag-and-drop-in-react-22778b30ba37
import React, { useState, useRef } from 'react'
import { useDrag, useDrop } from 'react-dnd'
import { ItemModal } from './ItemModal'
import '../../styles/style.css'

export const Item = ({ index, listSize, itemData, moveListItem, removeListItem }) => {

    // useDrag - the list item is draggable
    const [isDraggingEnabled, setIsDraggingEnabled] = useState(true);
    const [{ isDragging }, dragRef] = useDrag({
        type: 'item',
        item: { index },
        canDrag: isDraggingEnabled,
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    })

    // useDrop - the list item is also a drop area
    const [spec, dropRef] = useDrop({
        accept: 'item',
        hover: (item, monitor) => {
            const dragIndex = item.index
            const hoverIndex = index
            const hoverBoundingRect = ref.current?.getBoundingClientRect()
            const hoverMiddleY = (hoverBoundingRect.bottom - hoverBoundingRect.top) / 2
            const hoverActualY = monitor.getClientOffset().y - hoverBoundingRect.top

            // if dragging down, continue only when hover is smaller than middle Y
            if (dragIndex < hoverIndex && hoverActualY < hoverMiddleY) return
            // if dragging up, continue only when hover is bigger than middle Y
            if (dragIndex > hoverIndex && hoverActualY > hoverMiddleY) return

            moveListItem(dragIndex, hoverIndex)
            item.index = hoverIndex
        },
    })

    //Move + Remove item functions
    const moveItemUp = (event) => {
        event.stopPropagation()
        moveListItem(index, index-1)
        index -= 1
    }
    const moveItemDown = (event) => {
        event.stopPropagation()
        moveListItem(index, index+1)
        index += 1
    }
    const removeItem = (event) => {
        event.stopPropagation()
        removeListItem(index)
    }

    //Modal functions that disable dragging
    const [isModalOpen, setIsModalOpen] = useState(false);
    const openModal = () => {
        setIsDraggingEnabled(false)
        setIsModalOpen(true)
    }
    const closeModal = () => {
        setIsDraggingEnabled(true)
        setIsModalOpen(false)
    }

    // Join the 2 refs together into one (both draggable and can be dropped on)
    const ref = useRef(null)
    const dragDropRef = dragRef(dropRef(ref))

    return (
        <React.Fragment>
            
            {/*Make items being dragged transparent, so it's easier to see where we drop them*/}
            <div onClick={!isModalOpen ? openModal : undefined} ref={dragDropRef} className={[
                "entry", 
                isModalOpen ? "defaultCursor" : "moveCursor", 
                isDragging ? "itemDrag" : "itemNoDrag"
            ].join(" ")}>
                {itemData.runName}
                <button type ='button' onClick={moveItemUp} disabled={index==0}>Move Up</button>
                <button type ='button' onClick={moveItemDown} disabled={index==listSize-1}>Move Down</button>
                <button type ='button' onClick={removeItem}>Remove</button>
                {isModalOpen && <ItemModal
                    itemData={itemData}
                    closeModal={closeModal}
                />}
            </div>
        </React.Fragment>
    )
}