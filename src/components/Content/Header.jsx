import '../../styles/style.scss'

export const Header = () => {

    return (
            <div className = "header">
                <h1 className = "title">LiveSplit File Merger</h1>
                <label>A simple React tool that allows you to combine multiple <a className="web-link" href="https://livesplit.org/" target="_blank">LiveSplit</a> files from different speedruns into one big splits file that you can then download. You can use this tool for multi-game speedruns, main board/all category marathons, and even for longer categories that consist of multiple smaller ones. Everything is performed on the client-side within your web browser so nothing will ever be sent or stored onto a server.</label><br/><br/>
                <label>Click <span className="clipboard" onClick={() => navigator.clipboard.writeText("https://tinyurl.com/2fe8stbn")}>here</span> to copy the project's TinyURL link of this tool to your clipboard that you can share with others.</label>
            </div>
        )
}