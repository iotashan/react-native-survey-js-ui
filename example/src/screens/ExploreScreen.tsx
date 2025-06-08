import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  componentCatalog,
  QuestionCategory,
  ComponentInfo,
  getCategorizedComponents,
  searchComponents,
} from '../data/componentCatalog';

interface Props {
  navigation?: any;
}

export default function ExploreScreen({ navigation }: Props) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<
    QuestionCategory | 'all'
  >('all');

  // Get filtered components based on search and category
  const filteredComponents = useMemo(() => {
    let components = searchQuery
      ? searchComponents(searchQuery)
      : componentCatalog;

    if (selectedCategory !== 'all') {
      components = components.filter((c) => c.category === selectedCategory);
    }

    return components;
  }, [searchQuery, selectedCategory]);

  // Get component counts by category
  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = { all: componentCatalog.length };
    const categorized = getCategorizedComponents();

    Object.entries(categorized).forEach(([category, components]) => {
      counts[category] = components.length;
    });

    return counts;
  }, []);

  const handleComponentPress = (component: ComponentInfo) => {
    navigation?.navigate('ComponentDetails', {
      componentType: component.type,
    });
  };

  const renderComponent = ({ item }: { item: ComponentInfo }) => (
    <TouchableOpacity
      style={styles.componentItem}
      onPress={() => handleComponentPress(item)}
      testID={`component-item-${item.type}`}
    >
      <View style={styles.componentHeader}>
        <Text
          style={styles.componentIcon}
          testID={`component-icon-${item.type}`}
        >
          {item.icon}
        </Text>
        <View style={styles.componentInfo}>
          <Text style={styles.componentName}>{item.name}</Text>
          <Text style={styles.componentType}>{item.type}</Text>
        </View>
      </View>
      <Text style={styles.componentDescription}>{item.description}</Text>
      <View style={styles.tagContainer}>
        {item.tags.map((tag) => (
          <View key={tag} style={styles.tag} testID={`tag-${item.type}-${tag}`}>
            <Text style={styles.tagText}>{tag}</Text>
          </View>
        ))}
      </View>
    </TouchableOpacity>
  );

  const renderCategoryTab = (
    category: QuestionCategory | 'all',
    label: string
  ) => (
    <TouchableOpacity
      key={category}
      style={[
        styles.categoryTab,
        selectedCategory === category && styles.categoryTabActive,
      ]}
      onPress={() => setSelectedCategory(category)}
      testID={`category-tab-${category}`}
    >
      <Text
        style={[
          styles.categoryTabText,
          selectedCategory === category && styles.categoryTabTextActive,
        ]}
      >
        {label}
      </Text>
      <View style={styles.countBadge} testID={`category-count-${category}`}>
        <Text style={styles.countText}>{categoryCounts[category] || 0}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        testID="explore-scroll-view"
        stickyHeaderIndices={[0]}
      >
        <View style={styles.stickyHeader}>
          <View style={styles.header}>
            <Text style={styles.title}>Explore Components</Text>
            <Text style={styles.subtitle}>
              Interactive catalog of survey components
            </Text>
          </View>

          {/* Search Bar */}
          <View style={styles.searchContainer}>
            <TextInput
              style={styles.searchInput}
              placeholder="Search components..."
              value={searchQuery}
              onChangeText={setSearchQuery}
              testID="search-input"
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchQuery('')}
                testID="search-clear-button"
              >
                <Text style={styles.clearButtonText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Category Tabs */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryTabs}
            testID="category-tabs"
          >
            {renderCategoryTab('all', 'All')}
            {Object.values(QuestionCategory).map((category) =>
              renderCategoryTab(category, category)
            )}
          </ScrollView>
        </View>

        {/* Component List */}
        {filteredComponents.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No components found</Text>
          </View>
        ) : (
          <FlatList
            data={filteredComponents}
            renderItem={renderComponent}
            keyExtractor={(item) => item.type}
            scrollEnabled={false}
            testID="component-list"
            contentContainerStyle={styles.listContent}
          />
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
  },
  stickyHeader: {
    backgroundColor: '#f5f5f5',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  searchInput: {
    flex: 1,
    height: 48,
    fontSize: 16,
    color: '#333',
  },
  clearButton: {
    padding: 8,
  },
  clearButtonText: {
    fontSize: 18,
    color: '#666',
  },
  categoryTabs: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  categoryTab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    backgroundColor: '#fff',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  categoryTabActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  categoryTabText: {
    fontSize: 14,
    color: '#666',
    marginRight: 6,
  },
  categoryTabTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  countBadge: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 20,
    alignItems: 'center',
  },
  countText: {
    fontSize: 12,
    color: '#333',
    fontWeight: '600',
  },
  listContent: {
    paddingVertical: 8,
  },
  componentItem: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginVertical: 8,
    padding: 16,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  componentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  componentIcon: {
    fontSize: 32,
    marginRight: 12,
  },
  componentInfo: {
    flex: 1,
  },
  componentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  componentType: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
  componentDescription: {
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 12,
  },
  tagContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 6,
    marginBottom: 6,
  },
  tagText: {
    fontSize: 12,
    color: '#666',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyStateText: {
    fontSize: 16,
    color: '#666',
  },
});
