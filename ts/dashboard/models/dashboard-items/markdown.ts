module ts {
  export module models {

    export class Markdown {
      static meta: DashboardItemMetadata = {
        item_type: 'markdown',
        display_name: 'Markdown',
        icon: 'fa fa-code',
        category: 'display',
        template: ds.templates.models.markdown
      }

      text: string
      expanded_text: string
      raw: boolean = false

      constructor(data?: any) {
        super(data)
        if (data) {
          this.text = data.text
          if (data.raw !== undefined) {
            this.raw = data.raw
          }
        }
      }

      render_templates(context?: any) : void {
        try {
          this.expanded_text = ds.render_template(this.text, context)
        } catch (e) {
          this.expanded_text = e.toString()
        }
      }

      toJSON() : any {
        return $.extend(super.toJSON(), {
          text: this.text,
          raw: this.raw
        })
      }

      interactive_properties(): PropertyListEntry[] {
        return [
          {
            name: 'markdown.text',
            type: 'textarea',
            property_name: 'text'
          },
          { name: 'height', type: 'number' },
          'css_class'
        ]
      }
    }
    ts.models.register_dashboard_item(Markdown)
  }
}
