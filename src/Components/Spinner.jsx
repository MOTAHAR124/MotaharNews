import React from 'react'
import loading from './loading.gif'

// export class Spinner extends Component {        {  //{Used only on class Based }

    // render() {
    const Spinner = () =>{
        return (
            <div className="text-center">
                <img src={loading} alt="loading" />
            </div>
        )
    }
// }

export default Spinner