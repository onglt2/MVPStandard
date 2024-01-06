import React from 'react'
import { Form, Checkbox } from 'semantic-ui-react';
import { SingleInput } from '../Form/SingleInput.jsx';

export default class TalentStatus extends React.Component {
    constructor(props) {
        super(props);
        const status = props.status ? Object.assign({}, props.status) : { status: "" }
        

        this.state = {

            jobSeekingStatus: status,
        }

        this.handleChange = this.handleChange.bind(this)

    }


    handleChange(event) {
        
        const data = Object.assign({}, this.state.jobSeekingStatus)
        const newStatus = event.target.value
        data["status"] = newStatus
        


        this.setState({
            jobSeekingStatus: data,
        })
        
        this.props.saveProfileData(this.props.componentId, data)
    }

    render() {
        return (
            this.renderDisplay()
        )

    }
    renderDisplay() {
        const text = ["Actively looking for a job",
            "Not looking for a job at the moment",
            "Currently employed but open to offers",
            "Will be available on later date"]

        
        const selected = this.props.status;
        
        return (

            <div className='ui sixteen wide column'>

                <div className="fields">
                    <br /> Current Status
                </div>
                <div className="fields">
                    < div className="field" >

                        <div className="ui radio checkbox">
                            <input type="radio" name="status" value={text[0]} checked={selected == text[0]} onChange={this.handleChange} />
                            <label>Actively looking for a job</label>
                        </div>
                    </div>
                </div>
                <div className="fields">
                    < div className="field" >

                        <div className="ui radio checkbox">
                            <input type="radio" name="status" value={text[1]} checked={selected == text[1]} onChange={this.handleChange} />
                            <label>Not looking for a job at the moment</label>
                        </div>
                    </div>
                </div>
                <div className="fields">
                    < div className="field" >

                        <div className="ui radio checkbox">
                            <input type="radio" name="status" value={text[2]} checked={selected == text[2]} onChange={this.handleChange} />
                            <label>Currently employed but open to offers</label>
                        </div>
                    </div>
                </div>
                <div className="fields">
                    < div className="field" >

                        <div className="ui radio checkbox">
                            <input type="radio" name="status" value={text[3]} checked={selected == text[3]} onChange={this.handleChange} />
                            <label>Will be available on later date</label>
                        </div>
                    </div>
                </div>

            </div >
        )


    }
}