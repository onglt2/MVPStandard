import React from 'react';
import Cookies from 'js-cookie';
import { ChildSingleInput } from '../Form/SingleInput.jsx';
import { Button, Label, Icon, Table } from 'semantic-ui-react';

export default class Skill extends React.Component {
    constructor(props) {
        super(props);

        const skill = props.skillData ? props.skillData : [{ Name: "", Level: "", Id: "", UserId: "" }]



        this.state = {
            showEditSection: false,
            skillData: skill,
            show: false,
            id: 1,
            addrow: false,
            newSkill: { name: "", level: "", id: "", userId: "", isDeleted: "" }

        }

        this.addDisplay = this.addDisplay.bind(this)
        this.closeDisplay = this.closeDisplay.bind(this)
        this.addRecord = this.addRecord.bind(this)
        this.handleChange = this.handleChange.bind(this)
        this.loadData = this.loadData.bind(this);
        this.updateSkill = this.updateSkill.bind(this);
        this.deleteSkill = this.deleteSkill.bind(this);
      
    };

    componentDidUpdate(prevProps) {
        
        if (this.props.skillData !== prevProps.skillData) {
            
        }
    }


    componentDidMount() {

        this.loadData();
    };

    loadData() {
        return new Promise((resolve, reject) => {
        
            var link = 'https://mvpstandard-p.azurewebsites.net/profile/profile/getSkill'
        

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
                            skillData: res.data,
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
        
        const data = Object.assign({}, this.state.newSkill)

        data[event.target.name] = event.target.value
        this.setState({
            newSkill: data
        })

    }

    addRecord() {

        const l = this.props.skillData;
        if (this.state.newSkill.level == "" || this.state.newSkill.name == "") {
            alert("skill and level cannot be empty");
            return;
        }

        if (l.findIndex(item => item.name.toUpperCase() === this.state.newSkill.name.toUpperCase()) !== -1) {
            alert("Skill already exists!")
            this.setState({ newSkill: { name: "", level: "", id: "", userId: "", isDeleted: "" } })
            return;
        }

        var h = this.state.newSkill;               
        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: 'https://mvpstandard-p.azurewebsites.net/profile/profile/addSkill',
            
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            data: JSON.stringify(h),
            success: function (res) {
                
                if (res.success == true) {
                    TalentUtil.notification.show("Skill added sucessfully", "success", null, null)
                        this.loadData().then(() => { // Load data after state has been updated
                        this.props.updateProfileData(this.props.componentId, this.state.skillData);
                        });
                    
                } else {
                    TalentUtil.notification.show("Skill did not update successfully", "error", null, null)
                }

            }.bind(this),
            error: function (res, a, b) {
                console.log(res)
                console.log(a)
                console.log(b)
            }
        })


        this.setState({
            newSkill: { name: "", level: "" },
        })

        
        
    }


    updateSkill(data) {


        const l = this.state.skillData;
        

        if (data.level == "" || data.name == "") {
            alert("pls fill update");
            return;
        }

        var result = l.findIndex(item => item.id == data.id)
        
        if (l.findIndex(item => item.name.toUpperCase() == data.name.toUpperCase()) !== -1 && l[result].name.toUpperCase() != data.name.toUpperCase()) {
            alert("Skill already exists!")
            return;
        }

        
        l[result] = data;
               

        var cookies = Cookies.get('talentAuthToken');
        $.ajax({
            url: 'https://mvpstandard-p.azurewebsites.net/profile/profile/updateSkill',
            
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            data: JSON.stringify(data),
            success: function (res) {
                
                if (res.success == true) {
                    TalentUtil.notification.show("Skill updated sucessfully", "success", null, null)
                    this.setState({
                        newSkill: { name: '', level: '' },
                        skillData: l,
                        show: false,
                    })

                } else {
                    TalentUtil.notification.show("Skill id not update successfully", "error", null, null)
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

    deleteSkill(item) {
        var cookies = Cookies.get('talentAuthToken');
        const l = this.state.skillData;
        

        var index = l.findIndex(x => x.id == item.id)
        
        l.splice(index, 1);
        


        $.ajax({
            url: 'https://mvpstandard-p.azurewebsites.net/profile/profile/deleteSkill',
            
            headers: {
                'Authorization': 'Bearer ' + cookies,
                'Content-Type': 'application/json'
            },
            type: "POST",
            data: JSON.stringify(item),
            success: function (res) {
                
                if (res.success == true) {
                    TalentUtil.notification.show("Skill deleted  sucessfully", "success", null, null)
                } else {
                    TalentUtil.notification.show("Skill not deleted  successfully", "error", null, null)
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
        let skill = this.state.skillData;
        
        if (skill != null || skill != undefined) {
            for (var i = 0; i < skill.length; i++) {
                
                rows.push(
                    <SkillRow key={skill[i].id} item={skill[i]} openTable={this.openTable} updateSkill={this.updateSkill} deleteSkill={this.deleteSkill} />)
            }
           
        }


        
        let isState = this.state.show;
        let options = [];
        if (isState) {

            const levels = {
                "Beginner": "Beginner",
                "Intermediate": "Intermediate",
                "Expert": "Expert"
            }
            let skillLevel = Object.keys(levels).map((x) => <option key={x} value={x}>{x}</option>);

            
            let i = length > 0 ? length : 1
            
            options =

                <div className="fields">
                    <div className="field">
                        <input type="text"
                            value={this.state.newSkill.name}
                            name="name"
                            id="name"
                            placeholder="Add Skill"
                            onChange={this.handleChange}
                        />
                    </div>
                    <div className="field">
                        <select className="ui right labeled dropdown"
                            placeholder="Skill level"
                            value={this.state.newSkill.level}
                            onChange={this.handleChange}
                            name="level">
                            <option value="">Skill Level</option>
                            {skillLevel}
                        </select>
                    </div>
                    <div className="field">
                        <button type="button" className="ui button" onClick={() => this.addRecord(i)}>Add</button>
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
                                <Table.HeaderCell>Skill</Table.HeaderCell>
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

export class SkillRow extends React.Component {

    constructor(props) {
        super(props)

        this.state = {
            newSkill: { name: "", level: "", id: "", userId: "", isDeleted: "" },
            showP: false
        }
        this.updateSkill = this.updateSkill.bind(this);
        this.deleteSkill = this.deleteSkill.bind(this);
        this.updateOpen = this.updateOpen.bind(this);
        this.updateClose = this.updateClose.bind(this);
        this.handleChange = this.handleChange.bind(this)

    }
    handleChange(event) {
        event.preventDefault();
        
        const data = Object.assign({}, this.state.newSkill)

        data[event.target.name] = event.target.value
        
        this.setState({
            newSkill: data
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
            newSkill: this.props.item
        })
    }
    updateSkill(id, e) {
         
        const data = Object.assign({}, this.state.newSkill)
        data.id = id;
        this.setState({
            showP: false,
            newSkill: { name: "", level: "", id: "", userId: "", isDeleted: "" }
        })
        this.props.updateSkill(data);

    }

    deleteSkill(item) {
        
        this.props.deleteSkill(item);
    }


    render() {      

        return (
            this.state.showP ? this.renderUpdate() : this.renderDisplay()
        )

    }

    renderUpdate() {
        const levels = {
            "Beginner": "Beginner",
            "Intermediate": "Intermediate",
            "Expert": "Expert"
        }
        let skillLevel = Object.keys(levels).map((x) => <option key={x} value={x}>{x}</option>);


        const id = this.props.item.id;


        return (

            <Table.Row>
                <Table.Cell>
                    <input type="text"
                        value={this.state.newSkill.name}
                        name="name"
                        id="Name"
                        placeholder="Add Skill"
                        onChange={this.handleChange}
                    />
                </Table.Cell>
                <Table.Cell>
                    <select className="ui right labeled dropdown"
                        placeholder="skill level"
                        value={this.state.newSkill.level}
                        onChange={this.handleChange}
                        name="level">
                        <option value="">Skill level</option>
                        {skillLevel}
                    </select>


                </Table.Cell>
                <Table.Cell textAlign='right'>

                    <Button basic color='blue' onClick={(e) => this.updateSkill(id, e)}>
                        Update
                    </Button>
                    <Button basic color='red' onClick={this.updateClose}>
                        cancel
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
                <Button onClick={() => this.deleteSkill(item)} >
                    <Icon name='x' />
                </Button>
            </Table.Cell>
        </Table.Row >

        )
    }

}