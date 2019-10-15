/* Display a grid of opanisation cards from an [op]
 */
import { Avatar, Button, Checkbox, Popconfirm, Table, Dropdown, Icon, Menu } from "antd";
import Router from "next/router";
import PropTypes from "prop-types";
import React, { Component } from "react";
import { FormattedMessage } from "react-intl";

class InterestTable extends Component {
  constructor(props) {
    super(props);
    this.state = {
      filteredInfo: {},
      sortedInfo: {},
      filterSelectedRows: [], 
    };
    // console.log(props);
  }
  
 async handleInviteButtonClicked(interest) {
    if(Array.isArray(interest)) {
      console.log("interest", interest)
      await Promise.all(interest.map( async row => await this.props.onInvite(row)))
    } else {
      this.props.onInvite(interest);
    }
  }

  async handleDeclineButtonClicked(interest) {
    if(Array.isArray(interest)) {
      for (let interest of interest) await this.props.onDecline(interest)
    } else this.props.onDecline(interest);
  }

  async handleWithdrawInviteButtonClicked(interest) {
    if(Array.isArray(interest)) {
      for (let interest of interest) await this.props.onWithdrawInvite(interest)
    } else this.props.onWithdrawInvite(interest);
  }

  onChange = (pagination, filters, sorter) => {
    this.setState({
      filteredInfo: filters,
      sortedInfo: sorter
    });
    // console.log(this.state);
  };

  onSelectChange = (selectedRowKeys, selectedRows) => {
    // console.log(
    //   `selectedRowKeys: ${selectedRowKeys}`,
    //   "selectedRows: ",selectedRows);
    // const initialStatus = selectedRows[0].status;
    // const filterSelectedRows = selectedRows.filter( selectedRow => selectedRow.status === initialStatus);
    const filterSelectedRows = selectedRows;
    this.setState({ selectedRowKeys, filterSelectedRows });
  };

  render() {
    // console.log(this);
    let { sortedInfo, filteredInfo, filterSelectedRows } = this.state;
    
    sortedInfo = sortedInfo || {};
    filteredInfo = filteredInfo || {};
    const columns = [
      // {
      //   title: "Selected",
      //   key: "isSelected",
      //   render: (text, record) => {
      //     return <Checkbox value="selected" />;
      //   }
      // },
      {
        title: "Name",
        key: "imgUrl",
        sorter: (a, b) => a.person.nickname.length - b.person.nickname.length,
        sortOrder: sortedInfo.columnKey === "imgUrl" && sortedInfo.order,
        render: (text, record) => {
          return (
            <span>
              <Avatar
                size="large"
                shape="square"
                onClick={() => Router.push(`/people/${record.person._id}`)}
                src={record.person.imgUrl}
                icon="user"
              />
              &nbsp;&nbsp;
              {record.person.nickname}
            </span>
          );
        }
      },
      {
        title: "Comment",
        dataIndex: "comment",
        key: "comment"
      },
      {
        title: "Status",
        dataIndex: "status",
        key: "status",
        sorter: (a, b) => a.status.length - b.status.length,
        sortOrder: sortedInfo.columnKey === "status" && sortedInfo.order,
        filters: [
          { text: "interested", value: "interested" },
          { text: "invited", value: "invited" },
          { text: "committed", value: "committed" },
          { text: "declined", value: "declined" },
          { text: "completed", value: "completed" },
          { text: "cancelled", value: "cancelled" }
        ],
        filteredValue: filteredInfo.status || null,
        onFilter: (value, record) => record.status.includes(value)
      },
      {
        title: "Action",
        key: "action",
        render: (text, record) => {
          const options = getEnabledButtons(record);
          let withdrawInviteText = (
            <FormattedMessage
              id="withdrawVolunteerInvite"
              defaultMessage="Withdraw Invite"
              description="Button allowing event organizer to withdraw a invite already issued to an interested volunteer"
            />
          );

          // Needed? Or is declining the end of the road?
          if (
            options.withdrawInviteButtonEnabled &&
            !options.declineButtonEnabled &&
            !options.inviteButtonEnabled
          ) {
            withdrawInviteText = (
              <FormattedMessage
                id="undeclineInvite"
                defaultMessage="Undecline Invite"
                description='Button allowing event organizer to "un-decline" a previously declined invite'
              />
            );
          }

          return (
            <div>
              {options.inviteButtonEnabled ? (
                <span>
                  <Button
                    type="primary"
                    shape="round"
                    // onClick={this.handleInviteButtonClicked.bind(this, record)}
                    onClick={this.handleInviteButtonClicked.bind(this, record)}
                  >
                    <FormattedMessage
                      id="inviteVolunteer"
                      defaultMessage="Invite"
                      description="Button allowing event organizer to invite an interested volunteer"
                    />
                  </Button>
                  &nbsp;
                </span>
              ) : null}
              {options.withdrawInviteButtonEnabled ? (
                <span>
                  <Button
                    type="secondary"
                    shape="round"
                    onClick={this.handleWithdrawInviteButtonClicked.bind(
                      this,
                      record
                    )}
                  >
                    {withdrawInviteText}
                  </Button>
                  &nbsp;
                </span>
              ) : null}
              {options.declineButtonEnabled ? (
                <span>
                  <Popconfirm
                    id="declineInvitePopConfirm"
                    title="Are you sure?"
                    onConfirm={this.handleDeclineButtonClicked.bind(
                      this,
                      record
                    )}
                    okText="Yes"
                    cancelText="No"
                  >
                    <Button type="danger" shape="round">
                      <FormattedMessage
                        id="declineVolunteer"
                        defaultMessage="Decline"
                        description="Button allowing event organizer to decline an interested volunteer"
                      />
                    </Button>
                  </Popconfirm>
                </span>
              ) : null}
            </div>
          );
        }
      }
    ];
    const rowSelection = {
      // selectedRowKeys,
      onChange: this.onSelectChange,
      // getCheckboxProps: record => ({
      //   disabled: record.name === "Disabled User", // Column configuration not to be checked
      //   name: record.name
      // })
    };
    

    // here is group actions dropdown menu
    const menu =(
      <Menu>
        <Menu.Item>
          <a onClick={this.handleInviteButtonClicked.bind(this,filterSelectedRows)}>
            Invite
          </a>
        </Menu.Item>
        <Menu.Item>
          <a onClick={this.handleWithdrawInviteButtonClicked.bind(this,filterSelectedRows)}>
            Withdraw Invite
          </a>
        </Menu.Item>
        <Menu.Item>
          <a onClick={this.handleDeclineButtonClicked.bind(this,filterSelectedRows)}>
           Decline
          </a>
        </Menu.Item>
      </Menu>
    );
    return (
      <React.Fragment>
        <Dropdown overlay={menu}>
          <a className="ant-dropdown-link">
            Group Actions <Icon type="down" />
          </a>
        </Dropdown>
        <Table
          columns={columns}
          dataSource={this.props.interests}
          rowKey="_id"
          pagination={false}
          onChange={this.onChange}
          rowSelection={rowSelection}
        />
      </React.Fragment>
    );
  }
}

InterestTable.propTypes = {
  onInvite: PropTypes.func.isRequired,
  onWithdrawInvite: PropTypes.func.isRequired,
  onDecline: PropTypes.func.isRequired,
  interests: PropTypes.array
};

function getEnabledButtons(interest) {
  return {
    inviteButtonEnabled: interest.status === "interested",
    declineButtonEnabled:
      interest.status !== "completed" &&
      interest.status !== "cancelled" &&
      interest.status !== "declined",
    withdrawInviteButtonEnabled:
      interest.status !== "completed" &&
      interest.status !== "cancelled" &&
      interest.status !== "interested"
  };
}

export default InterestTable;
