# Chapter 4

#Exercise 1
# Combine .split, .shuffle, .join,
# to shuffle the letters in a given string

class Word
  def mixer(string)
      x = string.to_s
      x.split(//).shuffle.join
  end
end


#Execise 2
# add a shuffle method to the String class

class String
  def shuffle
    collector = []
    letters = self.split('')
    n = self.length
    
    while n > 0
      target = rand(n)
      collector << letters[target]
      letters.delete_at(target)
      n = n - 1
    end
      
    collector.join
    return collector
  end
end


# Exercise 3
# create 3 hashed

person1 = {:first => "bob", :last => "stillman"}
person2 = {:first => "janet", :last => "surkin"}
person3 = {:first => "ethan", :last => "surkin-stillman"}

params = {:father => person1, :mother => person2, :child => person3}







