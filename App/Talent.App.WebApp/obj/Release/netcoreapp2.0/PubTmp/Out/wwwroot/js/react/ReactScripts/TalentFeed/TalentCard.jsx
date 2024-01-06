import React from 'react';
import ReactPlayer from 'react-player';
import PropTypes from 'prop-types'
import { Popup, Button, Header, Grid, Icon, Card, Image } from 'semantic-ui-react'

export default class TalentCard extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            showSnapshot: false,
        }

        this.renderSnapshot = this.renderSnapshot.bind(this);
    };

    renderSnapshot() {
        const { photoId, currentEmployment, visa, level } = this.props.feed;
        return (
            <Card.Content>
                <Grid columns={2} divided>
                    <Grid.Column style={{ padding: 0 }}>
                        <Image src={photoId ? photoId : 'https://react.semantic-ui.com/images/avatar/large/matthew.png'} />
                    </Grid.Column>
                    <Grid.Column>
                        <Header size='small' content="Talent Snapshot" />
                        <Header sub>Current Employer</Header>
                        <span>{currentEmployment ? currentEmployment : "N/A"}</span>
                        <Header sub>Visa Status</Header>
                        <span>{visa ? visa : "N/A"}</span>
                        <Header sub>Position</Header>
                        <span>{level ? level : "N/A"}</span>
                    </Grid.Column>
                </Grid>
            </Card.Content>
        )
    }

    renderVideo() {
        return (
            <Card.Content style={{ padding: 0 }}>
                <video width="550" controls>
                    {/*<source src="mov_bbb.mp4" type="video/mp4" />*/}
                    {/*<source src="mov_bbb.ogg" type="video/ogg" />*/}
                    <source src="mov.mp4" type="video/mp4" />
                    <source src="mov.ogg" type="video/ogg" />
                    Your browser does not support HTML5 video.
                </video>
            </Card.Content>
        )
    }

    snapshotButton() {
        return (
            <Grid.Column className="center aligned">
                <Icon size="large"
                    name="user"
                    link
                    onClick={() => this.setState({ showSnapshot: true })}
                />
            </Grid.Column>
        )
    }

    videoButton() {
        return (
            <Grid.Column className="center aligned">
                <Icon size="large"
                    name="video camera"
                    link
                    onClick={() => this.setState({ showSnapshot: false })}
                />
            </Grid.Column>
        )
    }

    render() {
        if (this.props.feed) {
            const { showSnapshot } = this.state;
            const { name, skills } = this.props.feed;

            return (
                <Card fluid>
                    <Card.Content>
                        <Card.Header>{name}
                            <div className="ui right floated">
                                <Icon name="star" size="big" />
                            </div>
                        </Card.Header>
                    </Card.Content>
                    {showSnapshot ? this.renderSnapshot() : this.renderVideo()}
                    <Card.Content >
                        <Grid columns={4}>
                            {showSnapshot ? this.videoButton() : this.snapshotButton()}
                            <Grid.Column className="center aligned">
                                <Icon size="large" name="file pdf outline" link />
                            </Grid.Column>
                            <Grid.Column className="center aligned">
                                <Icon size="large" name="linkedin" link />
                            </Grid.Column>
                            <Grid.Column className="center aligned">
                                <Icon size="large" name="github" link />
                            </Grid.Column>
                        </Grid>
                    </Card.Content>
                    <Card.Content >
                        {skills.length > 0 ?
                            skills.map((skill, index) =>
                                <Button key={index} basic size="tiny" compact color="blue" content={skill} />
                            )
                            :
                            <Button basic disabled size="tiny" compact color="grey" content="N/A" />
                        }
                    </Card.Content>
                </Card >
            )
        }

        return null;
    }
}
