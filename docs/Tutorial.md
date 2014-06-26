# Tutorial

This tutorial introduces the editing user interface by walking through creating the simplest possible dashboard - one with a single query for random data, and two visualizations. 

## Create a blank dashboard

Once you've got Tessera running, launch a browser and load up the front page. If you're running with the default config from source, it will be at [localhost:5000](http://localhost:5000). 

![](tutorial-images/home-screen.png)

Click on the _Dashboards_ icon to go to the dashboard listing page, which is where you can create a new dashboard from. 

![](tutorial-images/dashboards-list.png)

Click on _New dashboard..._, then fill in some data in the form. The only required field is the title. 

![](tutorial-images/new-dashboard.png)

## Open the Editor

From the blank new dashboard that results, click on the _Edit_ button in the main toolbar. 

![](tutorial-images/empty-dashboard.png)

## Create a Data Query

Before laying out any elements, we need a data query. In the metadata panel that opened when you entered edit mode, click on the _Queries_ tab, then click the _+_ button to add a new query. 

![](tutorial-images/new-query.png)

That will create a new query with a placeholder Graphite expression to generate some random data. 

![](tutorial-images/query.png)


## Create the Initial Layout

In order to add anything to the dashboard, you have to start with a _section_ at the top level. Click the _+_ button in the main toolbar to add a new section. 

![](tutorial-images/new-section.png)

In edit mode, all items have a shaded title bar, with a badge in the upper left corner indicating the item's type and ID. Clicking on the badge will open a property sheet allowing you to edit that item. 

![](tutorial-images/section-edit-header.png)

After opening the property sheet for the section, add a new row to the section by clicking the Add button (labeled _+_) and selecting _Add new Row_ from the menu. 

![](tutorial-images/add-new-row.png)

The only items that you can add to rows are cells, which control the placement and width of presentations. Click on the _+_ button to add a new cell to the row. 

![](tutorial-images/add-new-cell.png)

Next, add a **Standard Time Series** chart to the cell. Click on the cell header badge to open the property sheet, then click on the _+_ button and select _Add new Standard Time Series_ from the menu. 

![](tutorial-images/add-dashboard-item-to-cell.png)

Open the property sheet for the new time series, and set the value of the query property. Click on the _Empty_ placeholder value and select `query0` from the popup menu. Confirm the choice by either clicking the checkmark button or pressing _Enter_ on the keyboard. 

![](tutorial-images/set-query.png)

Once you've set the query, the time series chart will immediately render. 

![](tutorial-images/hey-look-its-a-graph.png)

At this point it would be a good idea to save the edits - go back up to the main toolbar and click the _Save_ button. Alternatively, you can save instantly with the `ctrl-shift-s` keyboard shortcut. 

![](tutorial-images/save-dashboard.png)

Exit edit mode by click on the edit button again, or with the `ctrl-shift-e` keyboard shortcut. 

![](tutorial-images/almost-final.png)

Congratulations, it's a dashboard!
