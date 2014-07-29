- lazily calculate the values in Summation; cache them internally; use
  name of property as function to calculate
  (i.e. `summation.harmonic_mean` is a property that calls private
  `harmonic_mean()` function on the data series after checking for
  cached value first
