require 'rubygems'
require 'json'

f = File.new 'networks.json'
buff = ""
f.each_line {|l| buff << l }

all = JSON.parse buff
all.each do |curr|
  puts `curl #{curr['url']}`
end
