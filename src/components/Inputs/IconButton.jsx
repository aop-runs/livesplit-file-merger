import React from 'react'
import '../../styles/style.scss'

export const IconButton = ({ entryButton, classes, action, disableCon, description, icon }) => {

return (
        <React.Fragment>
            {entryButton !== undefined &&
                <button className={classes} type="button" disabled = {disableCon !== undefined && disableCon} onPointerDown={action} data-no-dnd="true" title={description}>
                    {icon}
                </button>
            }
            {entryButton == undefined &&
                <button className={classes} type="button" disabled = {disableCon !== undefined && disableCon} onClick={action} title={description}>
                    {icon}
                </button>
            }
        </React.Fragment>
    )
}