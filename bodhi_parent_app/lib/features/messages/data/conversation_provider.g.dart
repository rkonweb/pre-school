// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'conversation_provider.dart';

// **************************************************************************
// RiverpodGenerator
// **************************************************************************

String _$conversationDataHash() => r'6b6a8d032c571842efff8edd48bd407788ec3419';

/// Copied from Dart SDK
class _SystemHash {
  _SystemHash._();

  static int combine(int hash, int value) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + value);
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x0007ffff & hash) << 10));
    return hash ^ (hash >> 6);
  }

  static int finish(int hash) {
    // ignore: parameter_assignments
    hash = 0x1fffffff & (hash + ((0x03ffffff & hash) << 3));
    // ignore: parameter_assignments
    hash = hash ^ (hash >> 11);
    return 0x1fffffff & (hash + ((0x00003fff & hash) << 15));
  }
}

abstract class _$ConversationData
    extends BuildlessAutoDisposeAsyncNotifier<Map<String, dynamic>> {
  late final String conversationId;

  FutureOr<Map<String, dynamic>> build(
    String conversationId,
  );
}

/// See also [ConversationData].
@ProviderFor(ConversationData)
const conversationDataProvider = ConversationDataFamily();

/// See also [ConversationData].
class ConversationDataFamily extends Family<AsyncValue<Map<String, dynamic>>> {
  /// See also [ConversationData].
  const ConversationDataFamily();

  /// See also [ConversationData].
  ConversationDataProvider call(
    String conversationId,
  ) {
    return ConversationDataProvider(
      conversationId,
    );
  }

  @override
  ConversationDataProvider getProviderOverride(
    covariant ConversationDataProvider provider,
  ) {
    return call(
      provider.conversationId,
    );
  }

  static const Iterable<ProviderOrFamily>? _dependencies = null;

  @override
  Iterable<ProviderOrFamily>? get dependencies => _dependencies;

  static const Iterable<ProviderOrFamily>? _allTransitiveDependencies = null;

  @override
  Iterable<ProviderOrFamily>? get allTransitiveDependencies =>
      _allTransitiveDependencies;

  @override
  String? get name => r'conversationDataProvider';
}

/// See also [ConversationData].
class ConversationDataProvider extends AutoDisposeAsyncNotifierProviderImpl<
    ConversationData, Map<String, dynamic>> {
  /// See also [ConversationData].
  ConversationDataProvider(
    String conversationId,
  ) : this._internal(
          () => ConversationData()..conversationId = conversationId,
          from: conversationDataProvider,
          name: r'conversationDataProvider',
          debugGetCreateSourceHash:
              const bool.fromEnvironment('dart.vm.product')
                  ? null
                  : _$conversationDataHash,
          dependencies: ConversationDataFamily._dependencies,
          allTransitiveDependencies:
              ConversationDataFamily._allTransitiveDependencies,
          conversationId: conversationId,
        );

  ConversationDataProvider._internal(
    super._createNotifier, {
    required super.name,
    required super.dependencies,
    required super.allTransitiveDependencies,
    required super.debugGetCreateSourceHash,
    required super.from,
    required this.conversationId,
  }) : super.internal();

  final String conversationId;

  @override
  FutureOr<Map<String, dynamic>> runNotifierBuild(
    covariant ConversationData notifier,
  ) {
    return notifier.build(
      conversationId,
    );
  }

  @override
  Override overrideWith(ConversationData Function() create) {
    return ProviderOverride(
      origin: this,
      override: ConversationDataProvider._internal(
        () => create()..conversationId = conversationId,
        from: from,
        name: null,
        dependencies: null,
        allTransitiveDependencies: null,
        debugGetCreateSourceHash: null,
        conversationId: conversationId,
      ),
    );
  }

  @override
  AutoDisposeAsyncNotifierProviderElement<ConversationData,
      Map<String, dynamic>> createElement() {
    return _ConversationDataProviderElement(this);
  }

  @override
  bool operator ==(Object other) {
    return other is ConversationDataProvider &&
        other.conversationId == conversationId;
  }

  @override
  int get hashCode {
    var hash = _SystemHash.combine(0, runtimeType.hashCode);
    hash = _SystemHash.combine(hash, conversationId.hashCode);

    return _SystemHash.finish(hash);
  }
}

mixin ConversationDataRef
    on AutoDisposeAsyncNotifierProviderRef<Map<String, dynamic>> {
  /// The parameter `conversationId` of this provider.
  String get conversationId;
}

class _ConversationDataProviderElement
    extends AutoDisposeAsyncNotifierProviderElement<ConversationData,
        Map<String, dynamic>> with ConversationDataRef {
  _ConversationDataProviderElement(super.provider);

  @override
  String get conversationId =>
      (origin as ConversationDataProvider).conversationId;
}
// ignore_for_file: type=lint
// ignore_for_file: subtype_of_sealed_class, invalid_use_of_internal_member, invalid_use_of_visible_for_testing_member
