import React from 'react'
import Cookies from 'js-cookie'
import { default as Countries } from '../../../../util/jsonFiles/countries.json';
import { ChildSingleInput } from '../Form/SingleInput.jsx';

export class Address extends React.Component {
    constructor(props) {
        super(props)

        const addressData = this.props.addressData != null ? 
            Object.assign({}, this.props.addressData)
            : {
                number: "",
                street: "",
                suburb: "",
                postcode: "",
                city: "",
                country: ""
            }

        
        this.state = {
            showEditSection: false,
            newContact: addressData,
            selectedCountry: '',
            selectedCity: '',
        }

        this.openEdit = this.openEdit.bind(this)
        this.closeEdit = this.closeEdit.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.saveContact = this.saveContact.bind(this)
        this.renderEdit = this.renderEdit.bind(this)
        this.renderDisplay = this.renderDisplay.bind(this)
    }

    openEdit() {
        
        const addressData = Object.assign({}, this.props.addressData)
        this.setState({
            showEditSection: true,
            newContact: addressData
        })
    }

    closeEdit() {
        this.setState({
            showEditSection: false
        })
    }

    handleChange(event) {
        const data = Object.assign({}, this.state.newContact)
        data[event.target.name] = event.target.value
        this.setState({
            newContact: data
        })
        
    }

    updateForComponentId(componentId, newValues) {
        let data = {};
        data[componentId] = newValues;
        this.props.saveProfileData(data)
        this.closeEdit()
    }


    saveContact() {
        
        const data = Object.assign({}, this.state.newContact)
        let ComponentId = 'address'
        this.updateForComponentId(ComponentId, data)
    }
    

    render() {
        return (
            this.state.showEditSection ? this.renderEdit() : this.renderDisplay()
        )
    }

    renderEdit() {
        const countryOptions = Object.keys(Countries).map((country) => (
            <option key={country} value={country}>
                {country}
            </option>
        ));

        const cityOptions = Countries[this.state.newContact.country] || [];
        const citySelection = cityOptions.map((city) => (
            <option key={city} value={city}>
                {city}
            </option>
        ));

        return (
            <div className='ui sixteen wide column'>
                <div className="row">
                    <div className="fields">
                        <div className="four wide field">
                            <ChildSingleInput
                                inputType="text"
                                label="Number"
                                name="number"
                                value={this.state.newContact.number}
                                controlFunc={this.handleChange}
                                maxLength={80}
                                placeholder="Enter your block or unit number"
                                errorMessage="Please enter a valid numbner"
                            />
                        </div>
                        <div className="eight wide field">
                            <ChildSingleInput
                                inputType="text"
                                label="Street"
                                name="street"
                                value={this.state.newContact.street}
                                controlFunc={this.handleChange}
                                maxLength={80}
                                placeholder="Enter your street name"
                                errorMessage="Please enter a valid street name"
                            />
                        </div>

                        <div className="four wide field">
                            <ChildSingleInput
                                inputType="text"
                                label="Suburb"
                                name="suburb"
                                value={this.state.newContact.suburb}
                                controlFunc={this.handleChange}
                                maxLength={80}
                                placeholder="Enter your suburb name"
                                errorMessage="Please enter a valid suburb name"
                            />
                        </div>
                    </div>
                </div>

                <div className="row">
                    <div className="fields">
                        <div className="six wide field">                            
                            <label>Country</label>
                            <select
                                name="country"                                
                                value={this.state.newContact.country}                                  
                                onChange={this.handleChange}
                            >
                                <option value="">Select a country</option>
                                {countryOptions}
                            </select>
                        </div>

                        <div className="six wide field">
                        
                            <label>City</label>
                            <select
                                name="city"
                                value={this.state.newContact.city}
                                onChange={this.handleChange}
                            >
                                <option value="">Select a city</option>
                                {citySelection}
                            </select>
                        </div>

                        <div className="four wide field">
                            <ChildSingleInput
                                inputType="text"
                                label="Post Code"
                                name="postCode"
                                value={this.state.newContact.postCode}
                                controlFunc={this.handleChange}
                                maxLength={80}
                                placeholder="Enter your post code"
                                errorMessage="Please enter a valid post code"
                            />
                        </div>
                    </div>
                </div>

                <button type="button" className="ui teal button" onClick={this.saveContact}>Save</button>
                <button type="button" className="ui button" onClick={this.closeEdit}>Cancel</button>
            </div>
        )
    }

    renderDisplay() {

        let number = this.props.addressData ? `${this.props.addressData.number}` : ""
        let street = this.props.addressData ? `${this.props.addressData.street}` : ""
        let suburb = this.props.addressData ? `${this.props.addressData.suburb}` : ""
        let country = this.props.addressData ? `${this.props.addressData.country}` : ""
        let city = this.props.addressData ? `${this.props.addressData.city}` : ""
        let postCode = this.props.addressData ? `${this.props.addressData.postCode}` : ""
        
        return (
            <div className='row'>
                <div className="ui sixteen wide column">
                    <React.Fragment>
                        <p>Address: {number}, {street}, {suburb}, {postCode}</p>
                        <p>City: {city}</p>
                        <p>Country: {country}</p>
                        
                    </React.Fragment>
                    <button type="button" className="ui right floated teal button" onClick={this.openEdit}>Edit</button>
                </div>
            </div>
        )
    }

}

export class Nationality extends React.Component {
    constructor(props) {
        super(props)

        
        const nationalityData = this.props.nationalityData != null ?
            Object.assign({}, this.props.nationalityData)
            : {
                nationality: ""
            }
        
        this.state = {
            newContact: nationalityData,

        }
        
        
        this.handleChange = this.handleChange.bind(this)
        
    }

    handleChange(event) {
        const data = Object.assign({}, this.state.newContact)
        data[event.target.name] = event.target.value
        this.setState({
            newContact: data
        })
        this.props.saveProfileData(data)
    }

    
       
    render() {
        const countryOptions = Object.keys(Countries).map((country) => (
            <option key={country} value={country}>
                {country}
            </option>
        ));

        let nationality = this.props.nationalityData ? `${this.props.nationalityData}` : ""
        return (
            <div className='row'>
                <div className="ui sixteen wide column">
                    <React.Fragment>

                        <select
                            name="nationality"
                            value={nationality}
                            onChange={this.handleChange}
                        >
                            <option value="">Select your nationality</option>
                            {countryOptions}
                        </select>
                    </React.Fragment>

                </div>
            </div>
        )
    }
}