import React from 'react';
import moment from 'moment';
import { SingleInput } from '../Form/SingleInput.jsx';

export default class VisaStatus extends React.Component {
    constructor(props) {
        super(props)

        this.handleChange = this.handleChange.bind(this)
        this.handleSaveData = this.handleSaveData.bind(this)
        this.renderVisaExpiryDate = this.renderVisaExpiryDate.bind(this)
    }

    handleChange(event) {
        const { name, value } = event.target
        const data = {}
        data[name] = value
        if (name === 'visaStatus') {
            if ((value === 'Citizen') || (value === 'Permanent Resident')) {
                data['visaExpiryDate'] = null
                this.props.saveProfileData(data)
            } else {
                const today = new Date()
                data['visaExpiryDate'] = today
                this.props.updateProfileData(data)
            }
        } else {
            this.props.updateProfileData(data)
        }
    }

    handleSaveData() {
        const data = {}
        data.visaStatus = this.props.visaStatus
        data.visaExpiryDate = moment(this.props.visaExpiryDate).utc().toISOString();
        this.props.saveProfileData(data)
    }

    renderVisaExpiryDate() {
        const expiryDate = moment(this.props.visaExpiryDate).format("YYYY-MM-DD")
        
        return (
            <div className="eight wide field">
                <label>Visa expiry date</label>
                <div className="fields">
                    <div className="ten wide field">
                        <SingleInput
                            inputType="date"
                            name="visaExpiryDate"
                            controlFunc={this.handleChange}
                            isError={false}
                            content={expiryDate}
                            errorMessage="Please enter a valid visa expiry date"
                        />
                    </div>
                    <div className="four wide field">
                        <button type="button" className="ui teal button" onClick={this.handleSaveData}> Save</button>
                    </div>
                </div>
            </div>
        )
    }

    render() {
        const { visaStatus } = this.props
        const expiryDate = ((visaStatus === 'Permanent Resident') || (visaStatus === 'Citizen')) ? null
            : this.renderVisaExpiryDate()

        return (
            <div className="ui sixteen wide column">
                <div className="fields">
                    <div className="five wide field">
                        <label>Visa type</label>
                        <select className="ui right labeled dropdown"
                            placeholder="Visa Status"
                            value={visaStatus}
                            onChange={this.handleChange}
                            name="visaStatus">
                            <option value="0">Visa Status</option>
                            <option key="Citizen" value="Citizen">Citizen</option>
                            <option key="Permanent Resident" value="Permanent Resident">Permanent Resident</option>
                            <option key="Work Visa" value="Work Visa">Work Visa</option>
                            <option key="Student Visa" value="Student Visa">Student Visa</option>
                        </select>
                    </div>
                    {expiryDate}
                </div>
            </div>
        )
    }
}


