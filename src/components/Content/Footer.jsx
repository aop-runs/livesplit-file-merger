import { FaRegCopyright } from "react-icons/fa";
import '../../styles/style.scss'

export const Footer = () => {

    return (
            <div className = "footer">
                <div className="copyright-wrapper">
                    <label className="copyright-icon">
                        <FaRegCopyright />
                    </label>
                    <label>
                        {new Date().getFullYear()} Created and maintained by <a className="web-link" href="https://github.com/aop-runs" target="_blank">AnOrdinaryPerson</a>
                    </label>
                    <br/>
                    <label className="shifted-footer-text">
                        View project repository + source code <a className="web-link" href="https://github.com/aop-runs/livesplit-file-merger" target="_blank">here</a>
                    </label>
                </div>
            </div>
        )
}