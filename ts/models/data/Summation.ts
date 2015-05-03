module ts {
  export module models {
    export module data {

      /**
       * Summarized stats for a data series or set of series. When
       * constructed with a data series, computes the sum, min, max, and
       * mean.
       *
       * The input format is assumed to be the JSON representation returned
       * by graphite-web.
       */
      export class Summation extends Model {
        sum: number  = 0
        min: number = Number.MAX_VALUE
        min_index: number
        max: number = Number.MIN_VALUE
        max_index: number
        mean: number = 0
        median: number = 0
        first: number = 0
        last: number = 0
        last_non_zero: number = 0
        count: number = 0

        constructor(initial_data: any) {
          super(data)
          let datapoints = []

          if (initial_data && (initial_data instanceof Array) && (initial_data.length)) {
            /* This assumes that all input series have the same number of data points */
            var length = initial_data[0].datapoints.length
            for (var i = 0; i < length; i++) {
              var x = 0
              for (var n = 0; n < initial_data.length; n++) {
                /* ignore input series which are smaller than the first series */
                if (typeof(initial_data[n].datapoints[i]) !== 'undefined') {
                  x += initial_data[n].datapoints[i][0]
                }
              }
              datapoints.push([x, initial_data[0].datapoints[i][1]])
            }
          } else if (initial_data && initial_data.datapoints && initial_data.datapoints.length) {
            datapoints = initial_data.datapoints
          }

          if (datapoints && datapoints.length) {
            /* add simple-statistics methods */
            var values = ss.mixin(datapoints.map(point => point[0]))
            this.median = values.median()
            this.first = datapoints[0][0]
            this.count = datapoints.length
            if (this.first == null) {
              this.first = 0
            }
            var index = 0
            datapoints.forEach((point) => {
              var value = point[0] || 0
              this.last = value
              if (value != 0)
                this.last_non_zero = value
              this.sum = this.sum + value
              if (value > this.max) {
                this.max = value
                this.max_index = index
              }
              if (point[0] && (value < this.min)) {
                this.min = value
                this.min_index = index
              }
              index++
            })
            this.mean = this.sum / this.count

          } else if (typeof(initial_data) === 'object') {
            function if_defined(value, default_value) {
              return typeof(value) === 'undefined'
                ? default_value
                : value
            }

            this.sum   = if_defined(initial_data.sum,  this.sum)
            this.min   = if_defined(initial_data.min, this.min)
            this.min_index = if_defined(initial_data.min, this.min_index)
            this.max   = if_defined(initial_data.max, this.max)
            this.max_index = if_defined(initial_data.max, this.max_index)
            this.first = if_defined(initial_data.first, this.first)
            this.last  = if_defined(initial_data.last, this.last)
            this.last_non_zero  = if_defined(initial_data.last, this.last_non_zero)
            this.mean  = if_defined(initial_data.mean, this.mean)
            this.mean  = if_defined(initial_data.median, this.median)
            this.count = if_defined(initial_data.count, this.count)
          }

          if (this.sum === 0) {
            this.min = 0
            this.max = 0
          }
        } // end constructor()

        /**
         * Subtract other from this.
         */
        subtract(other: Summation) : Summation {
          return new Summation({
            sum:    this.sum    - other.sum,
            min:    this.min    - other.min,
            max:    this.max    - other.max,
            mean:   this.mean   - other.mean,
            median: this.median - other.median,
            first:  this.first  - other.first,
            last:   this.last   - other.last,
            count:  this.count
          })
        }

        toJSON() : any {
          return {
            sum: this.sum,
            min: this.min,
            min_index: this.min_index,
            max: this.max,
            max_index: this.max_index,
            mean: this.mean,
            median: this.median,
            first: this.first,
            last: this.last,
            last_non_zero: this.last_non_zero,
            count: this.count
          }
        }

      } // end class Summation

    } // end module data
  } // end module models
} // end module ts
