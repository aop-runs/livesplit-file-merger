//Based on: https://stackblitz.com/edit/vitejs-vite-yq3sun?file=src%2FApp.jsx
import React, { useState } from 'react'
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ItemModal } from './ItemModal'
import { BiWindowOpen } from "react-icons/bi";
import { GoTrash } from "react-icons/go";
import { TbArrowMoveUp, TbArrowMoveDown } from "react-icons/tb";
import '../../styles/style.scss'

export const Item = ({ id, index, listSize, unmaskPaths, canDownload, itemData, moveListItem, removeListItem }) => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: id, disabled: isModalOpen });
    const animation = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1, cursor: !isModalOpen ? (isDragging ? 'grabbing' : 'grab') : "default" };
    
    //Modal functions to open up information about the file
    const openModal = (event) => {
        event.stopPropagation()
        setIsModalOpen(true)
    }
    const closeModal = () => {
        setIsModalOpen(false)
    }
    
    //Move + Remove item functions
    const moveItemUp = (event, canMove) => {
        if(canMove){
            event.stopPropagation()
            moveListItem(index, index-1)
            index -= 1
        }
    }
    const moveItemDown = (event, canMove) => {
        if(canMove){
            event.stopPropagation()
            moveListItem(index, index+1)
            index += 1
        }
    }
    const removeItem = (event) => {
        event.stopPropagation()
        removeListItem(index)
    }

    return (
        //Item contents
        <div ref={setNodeRef} style={animation} {...attributes} {...listeners} className={"list-entry"} title="Click to drag this entry to another position">
        <span className="list-entry-text">
            {itemData.runName}
        </span><br/>
        <button className = {"list-icon" + (index == 0 ? " list-icon-disabled" : " list-icon-active")} onPointerDown={(event) => moveItemUp(event, index != 0)} data-no-dnd="true" disabled={index==0} title="Move this file up one spot in your entries">
            <TbArrowMoveUp />
        </button>
        <button className = {"list-icon" + (index == listSize-1 ? " list-icon-disabled" : " list-icon-active")} onPointerDown={(event) => moveItemDown(event, index != listSize-1)} data-no-dnd="true" disabled={index==listSize-1} title="Move this file down one spot in your entries">
            <TbArrowMoveDown />
        </button>
        <button className = "list-icon list-icon-active" onPointerDown={(event) => removeItem(event)} data-no-dnd="true" title="Remove this file from your entries">
            <GoTrash />
        </button>
        <button className = "list-icon list-icon-active" onPointerDown={(event) => openModal(event)} data-no-dnd="true" title="Open important contents for this entry">
            <BiWindowOpen />
        </button>
        {isModalOpen && <ItemModal
            itemData={itemData}
            index={index}
            unmaskPaths={unmaskPaths}
            canDownload={canDownload}
            closeModal={closeModal}
        />}
        </div>
    );
};