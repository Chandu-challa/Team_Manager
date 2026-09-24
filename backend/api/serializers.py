from rest_framework import serializers
from .models import User, TeamType, Team, Person, StateMaster, DistrictMaster, ConstituencyMaster, MandalMaster

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'phone', 'role', 'is_active', 'created_at']

class UserCreateUpdateSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'full_name', 'phone', 'role', 'is_active', 'password']
        extra_kwargs = {'password': {'write_only': True, 'required': False}}

    def create(self, validated_data):
        password = validated_data.pop('password', None)
        user = super().create(validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

    def update(self, instance, validated_data):
        password = validated_data.pop('password', None)
        user = super().update(instance, validated_data)
        if password:
            user.set_password(password)
            user.save()
        return user

class TeamTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = TeamType
        fields = '__all__'

class StateMasterSerializer(serializers.ModelSerializer):
    class Meta:
        model = StateMaster
        fields = '__all__'

class DistrictMasterSerializer(serializers.ModelSerializer):
    state_name = serializers.CharField(source='state.name', read_only=True)
    class Meta:
        model = DistrictMaster
        fields = '__all__'

class ConstituencyMasterSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True)
    class Meta:
        model = ConstituencyMaster
        fields = '__all__'

class MandalMasterSerializer(serializers.ModelSerializer):
    district_name = serializers.CharField(source='district.name', read_only=True)
    class Meta:
        model = MandalMaster
        fields = '__all__'

class TeamSerializer(serializers.ModelSerializer):
    type_name = serializers.CharField(source='type.name', read_only=True)
    type_level = serializers.IntegerField(source='type.level', read_only=True)
    
    state_name = serializers.CharField(source='state.name', read_only=True)
    district_name = serializers.CharField(source='district.name', read_only=True)
    constituency_name = serializers.CharField(source='constituency.name', read_only=True)
    mandal_name = serializers.CharField(source='mandal.name', read_only=True)
    
    # Kept for backward compatibility during migration
    parent_name = serializers.CharField(source='parent.name', read_only=True)
    
    class Meta:
        model = Team
        fields = '__all__'
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']

    def validate(self, data):
        # DRF ModelSerializer automatically calls instance.clean() for some things,
        # but to be perfectly safe, we instantiate an unsaved model and run clean()
        # and trap ValidationErrors.
        instance = Team(**data)
        # If updating, merge with existing
        if self.instance:
            for attr, value in data.items():
                setattr(instance, attr, value)
        
        try:
            instance.clean()
        except Exception as e:
            # Map Django ValidationError to DRF ValidationError
            from django.core.exceptions import ValidationError as DjangoValidationError
            if isinstance(e, DjangoValidationError):
                raise serializers.ValidationError(e.message_dict if hasattr(e, 'message_dict') else list(e.messages))
            raise serializers.ValidationError(str(e))
            
        return data

class PersonSerializer(serializers.ModelSerializer):
    team_name = serializers.CharField(source='team.name', read_only=True)
    team_type_name = serializers.CharField(source='team.type.name', read_only=True)
    team_type = serializers.IntegerField(source='team.type.id', read_only=True)
    state = serializers.IntegerField(source='team.state.id', read_only=True)
    district = serializers.IntegerField(source='team.district.id', read_only=True)
    constituency = serializers.IntegerField(source='team.constituency.id', read_only=True)
    mandal = serializers.IntegerField(source='team.mandal.id', read_only=True)
    
    state_name = serializers.CharField(source='team.state.name', read_only=True)
    district_name = serializers.CharField(source='team.district.name', read_only=True)
    constituency_name = serializers.CharField(source='team.constituency.name', read_only=True)
    mandal_name = serializers.CharField(source='team.mandal.name', read_only=True)

    class Meta:
        model = Person
        fields = '__all__'
        read_only_fields = ['created_by', 'updated_by', 'created_at', 'updated_at']

class DashboardSummarySerializer(serializers.Serializer):
    total_persons = serializers.IntegerField()
    total_team_types = serializers.IntegerField()
    total_teams = serializers.IntegerField()
    active_users = serializers.IntegerField()
