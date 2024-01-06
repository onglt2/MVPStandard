import React from 'react';
import Cookies from 'js-cookie';
import { ChildSingleInput } from '../Form/SingleInput.jsx';
import { Button, Label, Icon, Table } from 'semantic-ui-react';


export default class Language extends React.Component {
    constructor(props) {
        super(props)

        const language = props.languageData != null ? props.languageData : [{ Name: "", Level: "", Id: "", UserId: "", IsDeleted: "" }]
        
        this.state = {
            showEditSection: false,
            languageData: language,
            show: false,
            id: 1,
            addrow: false,
            newLanguage: { name: "", level: "", id: "", userId: "", isDeleted: "" }
        }        

        this.addDisplay = this.addDisplay.bind(this)
        this.closeDisplay = this.closeDisplay.bind(this)
        this.addRecord = this.addRecord.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.loadData = this.loadData.bind(this);
        this.updateLanguage = this.updateLanguage.bind(this);
        this.deleteLanguage = this.deleteLanguage.bind(this);
    }

    componentDidUpdate(prevProps) {
        
        if (this.props.languageData !== prevProps.languageData) {
            
        }
    }

    componentDidMount() {

        this.loadData();
    };

    loadData() {
        return new Promise((resolve, reject) => {
        
            var link = 'https://mvpstandard-p.azurewebsites.net/profile/profile/getLanguage'
        
        var cookies = Cookies.get('talentAuthToken');
            $.ajax({
                url: link,
                headers: {
                    'Authorization': 'Bearer ' + cookies,
                    'Content-Type': 'application/json'
                },
                type: "GET",
                contentType: "application/json",
                dataType: "json",
                success: function (res) {
                    if (res.success == true) {
                        
                        this.setState({
                            languageData: res.data,
                            show: false
                        }, () => resolve());
                    }
                }.bind(this),
                error: function (res, a, b) {
                    console.log(res);
                    console.log(a);
                    console.log(b);
                    reject(); 
                }
            });
        });
    }

        
    addDisplay(e) {
        e.preventDefault();
        this.setState({ show: true });
    }

    closeDisplay(e) {

        e.preventDefault();
        
        this.setState({
            show: false
        })

    }

    handleChange(event) {        
        const data = Object.assign({}, this.state.newLanguage)

        data[event.target.name] = event.target.value
        this.setState({
            newLanguage: data
        })

    }

    addRecord() {
        
        const l = this.props.languageData;
        if (this.state.newLanguage.level == "" || this.state.newLanguage.name == "") {
            alert("Language and level cannot be empty");
            return;
        }

        if (l.findIndex(item => item.name.toUpperCase() === this.state.newLanguage.name.toUpperCase()) !== -1) {
            alert("language already exists!")
            this.setState({ newLanguage: { name: "", level: "", id: "", userId: "", isDeleted: "" } })
            return;
        }
             
        var h = this.state.newLanguage;
        
        
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: 'https://mvpstandard-p.azurewebsites.net/profile/profile/addLanguage',
            
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            data: JSON.stringify(h),
            success: function (res) {
                
                if (res.success == true) {
                    TalentUtil.notification.show("Language added sucessfully", "success", null, null)
                    this.loadData().then(() => { // Load data after state has been updated
                        this.props.updateProfileData(this.props.componentId, this.state.languageData);
                    });
                } else {
                    TalentUtil.notification.show("Language id not update successfully", "error", null, null)
                }

            }.bind(this),
            error: function (res, a, b) {
                console.log(res)
                console.log(a)
                console.log(b)
            }
        })

        this.setState({
            newLanguage: { name: "", level: "" },
        })        

    }


    updateLanguage(data) {
        const l = this.state.languageData;
        
        
        if (data.level == "" || data.name == "") {
            alert("pls fill update");
            return;
        }
        
        var result = l.findIndex(item => item.id == data.id)

        if (l.findIndex(item => item.name.toUpperCase() == data.name.toUpperCase()) !== -1 && l[result].name.toUpperCase() != data.name.toUpperCase()) {
            alert("language already exists!")
            return;
        }

               
        l[result] = data;             

        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: 'https://mvpstandard-p.azurewebsites.net/profile/profile/updateLanguage',
            
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            data: JSON.stringify(data),
            success: function (res) {
                
                if (res.success == true) {
                    TalentUtil.notification.show("Language updated sucessfully", "success", null, null)
                    this.setState({
                        newLanguage: { name: '', level: '' },
                        languageData: l,
                        show: false,
                    })


                } else {
                    TalentUtil.notification.show("Language id not update successfully", "error", null, null)
                }

            }.bind(this),
            error: function (res, a, b) {
                console.log(res)
                console.log(a)
                console.log(b)
            }
        })

        this.props.updateProfileData(this.props.componentId, l)
    }

    deleteLanguage(item) {
        var cookies = Cookies.get('talentAuthToken');
        const l = this.state.languageData;
        
        

        var index = l.findIndex(x => x.id == item.id)
                
        l.splice(index, 1);       

        $.ajax({
            url: 'https://mvpstandard-p.azurewebsites.net/profile/profile/deleteLanguage',
            
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            data: JSON.stringify(item),
            success: function (res) {
                
                if (res.success == true) {
                    TalentUtil.notification.show("Language deleted  sucessfully", "success", null, null)
                } else {
                    TalentUtil.notification.show("Language not deleted  successfully", "error", null, null)
                }

            }.bind(this),
            error: function (res, a, b) {
                console.log(res)
                console.log(a)
                console.log(b)
            }
        })

        this.props.updateProfileData(this.props.componentId, l)
    }

        
    render() {

        return (
            this.renderDisplay()
        )
    }

    
    renderDisplay() {
        
        
        var rows = [];

        let lang = this.state.languageData;
        
        if (lang != null || lang != undefined) {
            for (var i = 0; i < lang.length; i++) {
                
                rows.push(
                    <LanguageRow key={lang[i].id} item={lang[i]} openTable={this.openTable} updateLanguage={this.updateLanguage} deleteLanguage={this.deleteLanguage} />)
            }
            
        }


        
        let isState = this.state.show;
        let options = [];
        if (isState) {

            const levels = {
                "Basic": "Basic",
                "Conversational": "Conversational",
                "Fluent": "Fluent",
                "Native / Bilingual": "Native / Bilingual"
            }
            let languageLevel = Object.keys(levels).map((x) => <option key={x} value={x}>{x}</option>);

            
            let i = length > 0 ? length : 1          
                       

            options =

                <div className="fields">
                    <div className="field">
                        <input type="text"
                            value={this.state.newLanguage.name}                           
                            name="name"
                            id="name"
                            placeholder="Add Language"
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="field">
                        <select className="ui right labeled dropdown"
                            placeholder="langauge level"
                            value={this.state.newLanguage.level}                            
                            onChange={this.handleChange}
                            name="level">
                            <option value="">Language Level</option>
                            {languageLevel}
                        </select>
                    </div>
                    <div className="field">
                        <button type="button" className="ui black button" onClick={() => this.addRecord(i)}>Add</button>
                    </div>
                    <div className="field">
                        <button type="button" className="ui button" onClick={this.closeDisplay}>Cancel</button>
                    </div>
                </div>

        }



        return (

            <div className='ui sixteen wide column'>
                <div>{options}
                </div>
                <div className="fields">
                    
                    <Table unstackable >
                        <Table.Header>
                            <Table.Row>
                                <Table.HeaderCell>Language</Table.HeaderCell>
                                <Table.HeaderCell>Level</Table.HeaderCell>
                                <Table.HeaderCell textAlign='right'>
                                    <Button color="black" onClick={this.addDisplay}>
                                        <Icon name='plus' />
                                        Add New </Button>
                                </Table.HeaderCell>
                            </Table.Row>
                        </Table.Header>
                        <Table.Body>
                            {rows}
                        </Table.Body>
                    </Table>
                </div>
            </div>


        )
    }
}



export class LanguageRow extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            newLanguage: { name: "", level: "", id: "", userId: "", isDeleted: "" },
            showP: false
        }
        this.updateLanguage = this.updateLanguage.bind(this);
        this.deleteLanguage = this.deleteLanguage.bind(this);
        this.updateOpen = this.updateOpen.bind(this);
        this.updateClose = this.updateClose.bind(this);
        this.handleChange = this.handleChange.bind(this)

    }

    handleChange(event) {
        event.preventDefault();
        
        const data = Object.assign({}, this.state.newLanguage)

        data[event.target.name] = event.target.value
        
        this.setState({
            newLanguage: data
        })

    }


    updateClose(event) {
        event.preventDefault();
        
        this.setState({
            showP: false
        })

    }


    updateOpen(event) {
        event.preventDefault();
        
        this.setState({
            showP: true,
            newLanguage: this.props.item
        })
    }

    updateLanguage(id, e) {        
        const data = Object.assign({}, this.state.newLanguage)
        data.id = id;

        this.setState({
            showP: false,
            newLanguage: { name: "", level: "", id: "", userId: "", isDeleted: "" }
        })
        this.props.updateLanguage(data);
    }

    deleteLanguage(item) {        
        this.props.deleteLanguage(item);
    }

    render() {  
        return (
            this.state.showP ? this.renderUpdate() : this.renderDisplay()
        )

    }

    renderUpdate() {
        const levels = {
            "Basic": "Basic",
            "Conversational": "Conversational",
            "Fluent": "Fluent",
            "Native / Bilingual": "Native / Bilingual"
        }
        let languageLevel = Object.keys(levels).map((x) => <option key={x} value={x}>{x}</option>);
        const id = this.props.item.id;


        return (

            <Table.Row>
                <Table.Cell>
                    <input type="text"
                        value={this.state.newLanguage.name}                        
                        name="name"
                        id="Name"
                        placeholder="Add Language"
                        onChange={this.handleChange}
                    />
                </Table.Cell>
                <Table.Cell>
                    <select className="ui right labeled dropdown"
                        placeholder="langauge level"
                        value={this.state.newLanguage.level}                        
                        onChange={this.handleChange}
                        name="level">
                        <option value="">language level</option>
                        {languageLevel}
                    </select>


                </Table.Cell>
                <Table.Cell textAlign='right'>

                    
                    <Button basic color='blue' onClick={(e) => this.updateLanguage(id, e)}>
                        Update
                    </Button>
                    
                    <Button basic color='red' onClick={this.updateClose}>
                        Cancel
                    </Button>
                </Table.Cell>
            </Table.Row>


        )

    }

    renderDisplay() {
        const item = this.props.item;

        return (<Table.Row>
            <Table.Cell>{item.name}</Table.Cell>
            <Table.Cell>{item.level}</Table.Cell>
            <Table.Cell textAlign='right'>
                <Button onClick={this.updateOpen} >
                    <Icon name='pencil' />
                </Button>
                <Button onClick={() => this.deleteLanguage(item)} >
                    <Icon name='x' />
                </Button>
            </Table.Cell>
        </Table.Row >

        )
    }


}


   
   