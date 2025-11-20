import React from 'react'
import '../../styles/style.css'

export const ItemModal = ({  name, text, closeModal }) => {
    
    return (
            //Modal div upon item click
            <React.Fragment>
                <div className="modal">
                    <div className="entry">
                        <h3>Filename: {name}</h3>
                        <p>Contents: {text}</p>
                        <button type ='button' onClick={closeModal}>Close Modal</button>
                    </div>
                </div>
            </React.Fragment>
        )
    }